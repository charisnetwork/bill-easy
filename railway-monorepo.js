const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

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

// Monorepo Gateway starting

// Start Main Backend
// Main Backend spawning on port 8001
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

// Start Admin Backend
// Admin Backend spawning on port 3025
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

// 1. Serve Main Frontend Static Files (HIGHEST PRIORITY)
const mainFrontendPath = path.join(__dirname, 'frontend/dist');
// Checking main frontend

// Frontend folder check done

if (fs.existsSync(mainFrontendPath) && fs.existsSync(path.join(mainFrontendPath, 'index.html'))) {
  // Main frontend found
  
  // Serve static files with proper caching
  app.use(express.static(mainFrontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
} else {
  // Main frontend not found
}

// 2. Proxy API routes (Use specific matching)
app.use('/admin/api', createProxyMiddleware({ 
  target: 'http://localhost:3025', 
  pathRewrite: { '^/admin/api': '/api' },
  changeOrigin: true,
  logLevel: 'debug',
  proxyTimeout: 60000,
  timeout: 60000
}));

app.use('/api', createProxyMiddleware({ 
  target: 'http://localhost:8001', 
  changeOrigin: true,
  logLevel: 'debug',
  proxyTimeout: 60000,
  timeout: 60000
}));

// 3. Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// 4. Serve Admin Frontend
const adminFrontendPath = path.join(__dirname, 'admin/frontend/dist');
if (fs.existsSync(adminFrontendPath)) {
  // Admin frontend found
  app.use('/admin-portal', express.static(adminFrontendPath));
  app.get('/admin-portal/*', (req, res) => {
    res.sendFile(path.join(adminFrontendPath, 'index.html'));
  });
}

// 5. Fallback for Main SPA (must be after /api and static)
if (fs.existsSync(mainFrontendPath)) {
  // SPA Fallback enabled
  
  // Catch-all route for SPA - MUST be last
  app.get('*', (req, res, next) => {
    // Skip API and uploads routes
    if (req.url.startsWith('/api') || req.url.startsWith('/admin/api') || req.url.startsWith('/uploads') || req.url.startsWith('/health')) {
      return next();
    }
    
    // SPA Fallback serving index.html
    res.sendFile(path.join(mainFrontendPath, 'index.html'), (err) => {
      if (err) {
        // SPA Fallback error
        next(err);
      }
    });
  });
} else {
  // SPA Fallback disabled
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
  // 404 Route not found
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
  // Monorepo Gateway running
});
