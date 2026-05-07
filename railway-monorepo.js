const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id']
}));

console.log(`🚀 Starting Main SaaS Gateway...`);

// Configure environment for the spawned backend
const backendEnv = {
  ...process.env,
  PORT: BACKEND_PORT,
  NODE_ENV: process.env.NODE_ENV || 'production'
};

console.log(`📦 Spawning Main SaaS Backend on port ${BACKEND_PORT}...`);
const mainBackend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  env: backendEnv,
  stdio: 'inherit'
});

mainBackend.on('exit', (code, signal) => {
  console.warn(`⚠️ Main SaaS backend process exited with code=${code}, signal=${signal}`);
});

mainBackend.on('error', (err) => {
  console.error('❌ Failed to start Main SaaS backend process:', err);
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

// Health Check for the Gateway itself
app.get('/health', (req, res) => {
  res.json({
    status: 'saas-gateway-ok',
    timestamp: new Date().toISOString()
  });
});

// Root Route Fallback (Since frontends are on Vercel)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h1 style="color: #2563eb;">🚀 Bill Easy Main SaaS API Gateway is ACTIVE</h1>
      <p>This is the gateway server routing to the <strong>Main SaaS</strong> backend.</p>
      <p><em>The frontend application is hosted separately on Vercel.</em></p>
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
  console.log(`✅ Main SaaS Gateway running on port ${PORT}`);
  console.log(`🔗 Main API Proxied: /api -> /api`);
  console.log(`🔗 Uploads: /uploads`);
  console.log(`🔗 Gateway Health: /health`);
});
