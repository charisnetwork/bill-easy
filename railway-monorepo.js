const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Determine which service to run based on environment variable
const SERVICE_TYPE = process.env.SERVICE_TYPE || 'main'; // 'main' or 'admin'
const BACKEND_PORT = process.env.BACKEND_PORT || '8081';

app.set('trust proxy', 1);

// Normalize URLs (fix double slashes like //api)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Enable CORS for all routes (Backend services also have their own CORS setup)
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret', 'x-admin-token', 'x-company-id']
}));

console.log(`🚀 Starting Monorepo Gateway for ${SERVICE_TYPE.toUpperCase()} service...`);

// Configure environment for the spawned backend
const backendEnv = {
  ...process.env,
  PORT: BACKEND_PORT,
  NODE_ENV: process.env.NODE_ENV || 'production'
};

if (SERVICE_TYPE === 'admin') {
  console.log(`📦 Spawning Admin Backend on port ${BACKEND_PORT}...`);
  spawn('node', ['server.js'], { 
    cwd: path.join(__dirname, 'admin/backend'),
    env: backendEnv,
    stdio: 'inherit'
  });

  // Proxy /admin/api traffic to the admin backend (which expects /api)
  app.use('/admin/api', createProxyMiddleware({ 
    target: `http://127.0.0.1:${BACKEND_PORT}`, 
    changeOrigin: true,
    pathRewrite: { '^/admin/api': '/api' },
    logLevel: 'debug',
    proxyTimeout: 60000,
    timeout: 60000
  }));
  
  // Also proxy direct /api requests to the admin backend
  app.use('/api', createProxyMiddleware({ 
    target: `http://127.0.0.1:${BACKEND_PORT}`, 
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 60000,
    timeout: 60000
  }));

} else {
  console.log(`📦 Spawning Main SaaS Backend on port ${BACKEND_PORT}...`);
  spawn('node', ['server.js'], { 
    cwd: path.join(__dirname, 'backend'),
    env: backendEnv,
    stdio: 'inherit'
  });

  // Proxy /api traffic to the main backend
  app.use('/api', createProxyMiddleware({ 
    target: `http://127.0.0.1:${BACKEND_PORT}`, 
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 60000,
    timeout: 60000
  }));

  // Serve Uploads from the Main Backend
  app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));
}

// Health Check for the Gateway itself
app.get('/health', (req, res) => {
  res.json({ 
    status: 'gateway-ok',
    serviceType: SERVICE_TYPE,
    timestamp: new Date().toISOString()
  });
});

// Root Route Fallback (Since frontends are on Vercel)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h1 style="color: #2563eb;">🚀 Bill Easy ${SERVICE_TYPE.toUpperCase()} API Gateway is ACTIVE</h1>
      <p>This is the gateway server routing to the <strong>${SERVICE_TYPE}</strong> backend.</p>
      <p><em>The frontend application is hosted separately.</em></p>
      <div style="margin-top: 2rem; padding: 1rem; background: #f3f4f6; border-radius: 8px; display: inline-block;">
        <strong>API Status:</strong> <a href="/api/health">Backend Health Check</a> | <a href="/health">Gateway Health Check</a>
      </div>
    </div>
  `);
});

// 404 handler for any unmatched routes
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found in gateway' });
});

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_TYPE.toUpperCase()} Gateway running on port ${PORT}`);
  if (SERVICE_TYPE === 'admin') {
    console.log(`🔗 Admin API Proxied: /admin/api -> /api (and /api -> /api)`);
  } else {
    console.log(`🔗 Main API Proxied: /api -> /api`);
    console.log(`🔗 Uploads: /uploads`);
  }
  console.log(`🔗 Gateway Health: /health`);
});
