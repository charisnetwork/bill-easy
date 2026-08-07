const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION in Gateway:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION in Gateway:', reason);
});

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.set('trust proxy', 1);

const backendHealth = {
  main: { ready: false, port: 8001, lastCheck: null }
};

app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'x-admin-secret', 'x-company-id']
}));

app.options('*', cors());

app.use((req, res, next) => {
  const host = req.headers.host || 'unknown';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'monorepo-gateway',
    frontend: fs.existsSync(path.join(__dirname, 'frontend/dist')) ? 'available' : 'not-found',
    backends: backendHealth,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Bill Easy API Gateway',
    status: 'running',
    port: PORT,
    backends: backendHealth,
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

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
    }
  });
};

const mainProxy = createProxy(
  'http://localhost:8001', 
  { '^/': '/api/' },
  'Main'
);

app.use('/api', mainProxy);

app.use(['/api'], (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

const mainFrontendPath = path.join(__dirname, 'frontend/dist');
if (fs.existsSync(mainFrontendPath) && fs.existsSync(path.join(mainFrontendPath, 'index.html'))) {
  console.log('✅ Main frontend found');
  
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    express.static(mainFrontendPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true
    })(req, res, next);
  });
  
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/health')) {
      return next();
    }
    
    res.sendFile(path.join(mainFrontendPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.log('⚠️ Main frontend not found at', mainFrontendPath);
}

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Monorepo Gateway running on port ${PORT}`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - Main API: http://localhost:${PORT}/api`);
});

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

Promise.all([
  waitForBackend('Main', 8001)
]).then(([mainReady]) => {
  if (mainReady) {
    console.log('✅ Main backend operational');
  } else {
    console.error('⚠️ Main backend not ready');
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mainBackend.kill();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mainBackend.kill();
  server.close(() => {
    process.exit(0);
  });
});
