import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';

import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import searchRoutes from './routes/search';
import breadcrumbRoutes from './routes/breadcrumbs';
import statsRoutes from './routes/stats';

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false
}));

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dealnamaa')
  .then(() => console.log('✅ Securely connected to MongoDB (DealNamaa Database)'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Static Files
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/breadcrumbs', breadcrumbRoutes);
app.use('/api/stats', statsRoutes);

// Test endpoint to verify file serving
app.get('/test-pdf', (req: Request, res: Response) => {
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
app.get('/', (req: Request, res: Response) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express Error:', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Secure Server running on http://0.0.0.0:${PORT}`);
});
