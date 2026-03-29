const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting Monorepo Gateway...');

// Start Main Backend
const mainBackend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'backend'),
  env: { ...process.env, PORT: 8001 },
  stdio: 'inherit'
});

// Start Admin Backend
const adminBackend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'admin/backend'),
  env: { ...process.env, PORT: 3025 },
  stdio: 'inherit'
});

// Proxy routes
app.use('/admin/api', createProxyMiddleware({ 
  target: 'http://localhost:3025', 
  pathRewrite: { '^/admin/api': '/api' },
  changeOrigin: true 
}));

app.use('/api', createProxyMiddleware({ 
  target: 'http://localhost:8001', 
  changeOrigin: true 
}));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'gateway-ok' });
});

app.listen(PORT, () => {
  console.log(`✅ Monorepo Gateway running on port ${PORT}`);
  console.log(`🔗 Main API: /api`);
  console.log(`🔗 Admin API: /admin/api`);
});
