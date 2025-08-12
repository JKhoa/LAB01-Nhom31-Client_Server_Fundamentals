const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware để parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware để thêm headers
app.use((req, res, next) => {
    // Custom headers
    res.setHeader('X-Powered-By', 'Lab01-Nhom31');
    res.setHeader('X-Server-Time', new Date().toISOString());
    res.setHeader('X-Lab-Version', '1.0.0');

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Log all requests
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);

    next();
});

// Serve static files từ public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint để lấy thông tin server
app.get('/api/info', (req, res) => {
    const serverInfo = {
        timestamp: new Date().toISOString(),
        server: {
            platform: os.platform(),
            architecture: os.arch(),
            hostname: os.hostname(),
            uptime: process.uptime(),
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        },
        system: {
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            loadAverage: os.loadavg(),
            networkInterfaces: Object.keys(os.networkInterfaces())
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        }
    };

    res.json(serverInfo);
});

// API endpoint để lấy timestamp
app.get('/api/time', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        unix: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: 'vi-VN'
    });
});

// API endpoint để echo data (POST)
app.post('/api/echo', (req, res) => {
    const echoData = {
        received: req.body,
        timestamp: new Date().toISOString(),
        method: req.method,
        contentType: req.get('Content-Type'),
        size: JSON.stringify(req.body).length
    };

    res.json(echoData);
});

// API endpoint để test performance
app.get('/api/performance', (req, res) => {
    const start = process.hrtime.bigint();

    // Simulate some work
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += Math.random();
    }

    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    res.json({
        duration: `${duration.toFixed(2)}ms`,
        result: sum,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString(),
        suggestions: [
            'Check the URL spelling',
            'Visit /api/info for server information',
            'Visit / for the homepage'
        ]
    });
});

// 500 Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong!',
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Lab 01 - Client-Server Fundamentals');
    console.log('👥 Nhóm 31');
    console.log('='.repeat(50));
    console.log(`📡 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🕒 Thời gian khởi động: ${new Date().toLocaleString('vi-VN')}`);
    console.log(`💻 Platform: ${os.platform()} ${os.arch()}`);
    console.log(`🖥️  Hostname: ${os.hostname()}`);
    console.log(`⚡ Node.js version: ${process.version}`);
    console.log('='.repeat(50));
    console.log('📋 Available endpoints:');
    console.log('   GET  /              - Homepage');
    console.log('   GET  /api/info      - Server information');
    console.log('   GET  /api/time      - Current timestamp');
    console.log('   POST /api/echo      - Echo request data');
    console.log('   GET  /api/performance - Performance test');
    console.log('   GET  /health        - Health check');
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Server đang tắt...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n📴 Server đã được tắt bởi người dùng');
    process.exit(0);
});