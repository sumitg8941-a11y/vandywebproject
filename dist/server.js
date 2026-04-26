"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const public_1 = __importDefault(require("./routes/public"));
const admin_1 = __importDefault(require("./routes/admin"));
const search_1 = __importDefault(require("./routes/search"));
const breadcrumbs_1 = __importDefault(require("./routes/breadcrumbs"));
const stats_1 = __importDefault(require("./routes/stats"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false
}));
app.use((0, cors_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);
app.use(express_1.default.json({ limit: '10kb' }));
// Database Connection
mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dealnamaa')
    .then(() => console.log('✅ Securely connected to MongoDB (DealNamaa Database)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
// Static Files
app.use(express_1.default.static(path_1.default.join(__dirname, '..')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Routes
app.use('/api', public_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/search', search_1.default);
app.use('/api/breadcrumbs', breadcrumbs_1.default);
app.use('/api/stats', stats_1.default);
// Test endpoint to verify file serving
app.get('/test-pdf', (req, res) => {
    res.send(`
    <html>
      <head><title>PDF Test</title></head>
      <body>
        <h1>PDF Serving Test</h1>
        <p>Click links below to test PDF access:</p>
        <ul>
          <li><a href="/uploads/1777204721693-924986660.pdf" target="_blank">Direct PDF Link</a></li>
          <li><a href="/uploads/" target="_blank">Uploads Directory</a></li>
        </ul>
        <h2>Embedded PDF Test:</h2>
        <iframe src="/uploads/1777204721693-924986660.pdf" width="100%" height="600px"></iframe>
      </body>
    </html>
  `);
});
// Root route - redirect to Next.js frontend
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head><title>DealNamaa API</title></head>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1>🚀 DealNamaa API Server</h1>
        <p>Backend is running successfully on port 3000</p>
        <ul style="list-style: none; padding: 0;">
          <li><a href="/api/health">API Health Check</a></li>
          <li><a href="/admin.html">Admin Dashboard</a></li>
          <li><a href="http://localhost:3001" target="_blank">Frontend (Port 3001)</a></li>
        </ul>
      </body>
    </html>
  `);
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Express Error:', err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Secure Server running on http://0.0.0.0:${PORT}`);
});
