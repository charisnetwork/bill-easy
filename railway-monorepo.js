const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

// --- PORT CONFIGURATION ---
// Railway gives us process.env.PORT. We must run the Gateway on that.
// The spawned backend MUST run on a different internal port.
const GATEWAY_PORT = process.env.PORT || 8080;
let MAIN_BACKEND_PORT = process.env.MAIN_BACKEND_PORT || 8081;

// Safety check: If they are the same, increment the backend port
if (parseInt(GATEWAY_PORT) === parseInt(MAIN_BACKEND_PORT)) {
    MAIN_BACKEND_PORT = parseInt(GATEWAY_PORT) + 1;
}

app.set('trust proxy', 1);

// Normalize URLs
app.use((req, res, next) => {
    if (req.url.includes('//')) {
        req.url = req.url.replace(/\/+/g, '/');
    }
    next();
});

// --- CORRECTED CORS ---
app.use(cors({
    // In production, you can replace '*' with your actual domain for better security
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log('🚀 Starting BillEasy Monorepo Gateway...');

// --- SPAWN BACKEND ---
console.log(`📦 Spawning Main Backend on internal port ${MAIN_BACKEND_PORT}...`);
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

mainBackend.on('error', (err) => {
    console.error('❌ Failed to start main backend process:', err);
});

// --- 1. SERVE STATIC FILES ---
const mainFrontendPath = path.join(__dirname, 'frontend/dist');

if (fs.existsSync(mainFrontendPath) && fs.existsSync(path.join(mainFrontendPath, 'index.html'))) {
    console.log('✅ Main frontend found, serving static files.');
    app.use(express.static(mainFrontendPath, {
        maxAge: '1d',
        etag: true,
        lastModified: true
    }));
} else {
    console.log('⚠️ Main frontend NOT found in frontend/dist.');
}

// --- 2. PROXY API ROUTES ---
app.use('/api', createProxyMiddleware({ 
    // Use 127.0.0.1 to avoid localhost resolution lag/errors in Node 18+
    target: `http://127.0.0.1:${MAIN_BACKEND_PORT}`, 
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 60000,
    timeout: 60000,
    on: {
        proxyReq: (proxyReq, req, res) => {
            // Optional: Pass headers to backend if needed
        },
        error: (err, req, res) => {
            console.error('[Proxy Error]:', err.message);
            if (!res.headersSent) {
                res.status(502).json({ error: 'Backend gateway timeout or crash.' });
            }
        }
    }
}));

// --- 3. SERVE UPLOADS ---
const uploadsPath = path.join(__dirname, 'backend/uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// --- 4. FALLBACK FOR SPA ---
if (fs.existsSync(mainFrontendPath)) {
    app.get('*', (req, res, next) => {
        // Exclusion list for routes that shouldn't hit index.html
        const exclusions = ['/api', '/admin/api', '/uploads', '/health'];
        if (exclusions.some(path => req.url.startsWith(path))) {
            return next();
        }
        
        res.sendFile(path.join(mainFrontendPath, 'index.html'), (err) => {
            if (err) {
                console.error('[SPA Fallback] Error:', err.message);
                res.status(500).send("Frontend build error");
            }
        });
    });
} else {
    app.get('/', (req, res) => {
        res.status(200).send(`<h1>Gateway Active</h1><p>Frontend dist not found.</p>`);
    });
}

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
    res.json({ 
        status: 'gateway-ok',
        backendPort: MAIN_BACKEND_PORT,
        timestamp: new Date().toISOString()
    });
});

app.listen(GATEWAY_PORT, () => {
    console.log(`✅ Gateway running on port ${GATEWAY_PORT}`);
    console.log(`🔗 Proxying /api -> ${MAIN_BACKEND_PORT}`);
});