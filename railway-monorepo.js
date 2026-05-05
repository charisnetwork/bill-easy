const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const MAIN_BACKEND_PORT = process.env.MAIN_BACKEND_PORT || '8080';

app.set('trust proxy', 1);

// Normalize URLs (fix double slashes like //api)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log('🚀 Starting Monorepo Gateway...');

// Start Main Backend
console.log(`📦 Spawning Main Backend on port ${MAIN_BACKEND_PORT}...`);
const mainBackendEnv = {
  ...process.env,
  PORT: MAIN_BACKEND_PORT,
  NODE_ENV: process.env.NODE_ENV || 'production'
};

const mainBackend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'backend'),
  env: mainBackendEnv,
  stdio: 'inherit'
});

// 1. Serve Main Frontend Static Files (HIGHEST PRIORITY)
const mainFrontendPath = path.join(__dirname, 'frontend/dist');

if (fs.existsSync(mainFrontendPath) && fs.existsSync(path.join(mainFrontendPath, 'index.html'))) {
  console.log('✅ Main frontend found, serving static files.');
  
  // Serve static files with proper caching
  app.use(express.static(mainFrontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
} else {
  console.log('⚠️ Main frontend NOT found in frontend/dist.');
}

// 2. Proxy API routes (Use specific matching)
app.use('/api', createProxyMiddleware({ 
  target: `http://localhost:${MAIN_BACKEND_PORT}`, 
  changeOrigin: true,
  logLevel: 'debug',
  proxyTimeout: 60000,
  timeout: 60000
}));

// 3. Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// 4. Admin frontend and API are handled by a separate Railway service at bill-easy/admin/

// 5. Fallback for Main SPA (must be after /api and static)
if (fs.existsSync(mainFrontendPath)) {
  console.log('✅ SPA Fallback enabled for routes like /purchases/new');
  
  // Catch-all route for SPA - MUST be last
  app.get('*', (req, res, next) => {
    // Skip API and uploads routes
    if (req.url.startsWith('/api') || req.url.startsWith('/admin/api') || req.url.startsWith('/uploads') || req.url.startsWith('/health')) {
      return next();
    }
    
    console.log(`[SPA Fallback] Serving index.html for: ${req.url}`);
    res.sendFile(path.join(mainFrontendPath, 'index.html'), (err) => {
      if (err) {
        console.error('[SPA Fallback] Error sending index.html:', err);
        next(err);
      }
    });
  });
} else {
  console.log('⚠️ SPA Fallback disabled - frontend/dist not found');
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h1 style="color: #2563eb;">🚀 Bill Easy Monorepo Gateway is ACTIVE</h1>
        <p>This is the gateway server. The main frontend (React) build was not found in <code>frontend/dist</code>.</p>
        <div style="margin-top: 2rem; padding: 1rem; background: #f3f4f6; border-radius: 8px; display: inline-block;">
          <strong>API Status:</strong> <a href="/api">Main API</a> | <a href="/admin/api">Admin API</a> | <a href="/health">Health Check</a>
        </div>
      </div>
    `);
  });
}

// 404 handler for API routes
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'gateway-ok',
    frontend: fs.existsSync(mainFrontendPath) ? 'available' : 'not-found',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Monorepo Gateway running on port ${PORT}`);
  console.log(`🔗 Main API: /api`);
  console.log(`🔗 Admin API: /admin/api`);
  console.log(`🔗 Admin Portal: /admin-portal`);
  console.log(`🔗 Uploads: /uploads`);
  console.log(`🔗 Health: /health`);
});
