const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Catch unhandled exceptions to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION in Gateway:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION in Gateway:', reason);
});

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.set('trust proxy', 1);

// Track backend health
const backendHealth = {
  main: { ready: false, port: 8001, lastCheck: null },
  admin: { ready: false, port: 3025, lastCheck: null }
};

// Normalize URLs (fix double slashes like //api)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Enable CORS for all routes - MUST be before other middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins but reflect them (required for credentials: true)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'x-admin-secret', 'x-company-id']
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
  const host = req.headers.host || 'unknown';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`  > Host: ${host}`);
  console.log(`  > Origin: ${req.headers.origin || 'none'}`);
  console.log(`  > User-Agent: ${req.headers['user-agent'] || 'none'}`);
  next();
});

// =========================================
// 1. HEALTH CHECK - IMMEDIATE (no dependencies)
// =========================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'monorepo-gateway',
    frontend: fs.existsSync(path.join(__dirname, 'frontend/dist')) ? 'available' : 'not-found',
    backends: backendHealth,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bill Easy API Gateway',
    status: 'running',
    port: PORT,
    backends: backendHealth,
    endpoints: {
      health: '/health',
      api: '/api',
      adminApi: '/admin/api',
      adminPortal: '/admin-portal'
    }
  });
});

// =========================================
// 2. API PROXY ROUTES (setup immediately)
// =========================================

// Proxy middleware factory with error handling
const createProxy = (target, pathRewrite, name) => {
  return createProxyMiddleware({
    target,
    pathRewrite,
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 60000,
    timeout: 60000,
    onError: (err, req, res) => {
      console.error(`[${name} Proxy Error]`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ 
          error: `${name} backend unavailable`, 
          message: err.message,
          code: 'BACKEND_UNAVAILABLE'
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${name} Proxy] ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${name} Proxy Response] ${proxyRes.statusCode} for ${req.url}`);
    }
  });
};

const adminProxy = createProxy(
  'http://localhost:3025', 
  { '^/admin/api': '/api' },
  'Admin'
);

const mainProxy = createProxy(
  'http://localhost:8001', 
  { '^/': '/api/' }, // Express strips /api when mounted at app.use('/api',...) — re-add it
  'Main'
);

// Admin API routes (more specific first)
app.use('/admin/api', adminProxy);
// Main API routes
app.use('/api', mainProxy);

// IMPORTANT: Add explicit handler to prevent API routes from falling through to static files
app.use(['/api', '/admin/api'], (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

// =========================================
// 3. STATIC FILES (after API routes)
// =========================================

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Main Frontend Static Files
const mainFrontendPath = path.join(__dirname, 'frontend/dist');
if (fs.existsSync(mainFrontendPath) && fs.existsSync(path.join(mainFrontendPath, 'index.html'))) {
  console.log('✅ Main frontend found');
  
  // Serve static files (but NOT for API routes)
  app.use((req, res, next) => {
    // Skip API routes - let them fall through to the 404 handler
    if (req.url.startsWith('/api') || req.url.startsWith('/admin/api')) {
      return next();
    }
    // Serve static files for non-API routes
    express.static(mainFrontendPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true
    })(req, res, next);
  });
  
  // SPA fallback - must be after API routes
  app.get('*', (req, res, next) => {
    // Skip API and uploads routes
    if (req.url.startsWith('/api') || req.url.startsWith('/admin/api') || req.url.startsWith('/uploads') || req.url.startsWith('/health')) {
      return next();
    }
    
    res.sendFile(path.join(mainFrontendPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
} else {
  console.log('⚠️ Main frontend not found at', mainFrontendPath);
}

// Admin Frontend
const adminFrontendPath = path.join(__dirname, 'admin/frontend/dist');
if (fs.existsSync(adminFrontendPath)) {
  console.log('✅ Admin frontend found');
  
  // Serve at /admin-portal path
  app.use('/admin-portal', express.static(adminFrontendPath));
  app.get('/admin-portal/*', (req, res) => {
    res.sendFile(path.join(adminFrontendPath, 'index.html'));
  });
  
  // Also serve at root for admin subdomain (admin.charisbilleasy.store)
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    if (host.startsWith('admin.')) {
      // Skip API routes - they should be proxied
      if (req.url.startsWith('/admin/api') || req.url.startsWith('/api')) {
        return next();
      }
      
      // For API requests from admin subdomain, rewrite /api to /admin/api for proxy
      if (req.url.startsWith('/api/')) {
        req.url = '/admin' + req.url;
        return next();
      }
      
      // Serve static files from admin frontend first
      const staticMiddleware = express.static(adminFrontendPath);
      staticMiddleware(req, res, (err) => {
        if (err) return next(err);
        // If static file not found, serve index.html (SPA behavior)
        if (!res.headersSent) {
          res.sendFile(path.join(adminFrontendPath, 'index.html'));
        }
      });
      return;
    }
    next();
  });
} else {
  console.log('⚠️ Admin frontend not found at', adminFrontendPath);
}

// 404 handler for API routes - MUST be last
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// =========================================
// START SERVER IMMEDIATELY (don't wait for backends)
// =========================================
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Monorepo Gateway running on port ${PORT}`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - Main API: http://localhost:${PORT}/api`);
  console.log(`   - Admin API: http://localhost:${PORT}/admin/api`);
  console.log(`   - Admin Portal: http://localhost:${PORT}/admin-portal`);
});

// =========================================
// BACKEND HEALTH MONITORING (in background)
// =========================================

const checkBackendHealth = (port, timeout = 5000) => {
  return new Promise((resolve) => {
    const request = http.get(`http://localhost:${port}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(timeout, () => {
      request.destroy();
      resolve(false);
    });
  });
};

// Wait for backend to be ready
const waitForBackend = async (name, port, maxAttempts = 60) => {
  console.log(`⏳ Waiting for ${name} backend on port ${port}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkBackendHealth(port, 2000);
    if (isHealthy) {
      console.log(`✅ ${name} backend is ready on port ${port}`);
      backendHealth[name.toLowerCase()].ready = true;
      backendHealth[name.toLowerCase()].lastCheck = new Date();
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.error(`❌ ${name} backend failed to start on port ${port}`);
  return false;
};

// Start Backends
const mainBackendEnv = {
  ...process.env,
  PORT: '8001',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

const mainBackend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'backend'),
  env: mainBackendEnv,
  stdio: 'inherit'
});

mainBackend.on('error', (err) => {
  console.error('❌ Main backend spawn error:', err);
});

const adminBackendEnv = {
  ...process.env,
  PORT: '3025',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

const adminBackend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'admin/backend'),
  env: adminBackendEnv,
  stdio: 'inherit'
});

adminBackend.on('error', (err) => {
  console.error('❌ Admin backend spawn error:', err);
});

// Monitor backends in background
console.log('🚀 Starting Bill Easy Monorepo Gateway...\n');

Promise.all([
  waitForBackend('Main', 8001),
  waitForBackend('Admin', 3025)
]).then(([mainReady, adminReady]) => {
  if (mainReady) {
    console.log('✅ Main backend operational');
  } else {
    console.error('⚠️ Main backend not ready');
  }
  if (adminReady) {
    console.log('✅ Admin backend operational');
  } else {
    console.error('⚠️ Admin backend not ready');
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mainBackend.kill();
  adminBackend.kill();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mainBackend.kill();
  adminBackend.kill();
  server.close(() => {
    process.exit(0);
  });
});
