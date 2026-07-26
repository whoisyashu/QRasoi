import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import ownerRoutes from './routes/owner.routes.js';
import chefRoutes from './routes/chef.routes.js';
import cloudinaryRoutes from './routes/cloudinary.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

import adminRoutes from './routes/admin.routes.js';

export const app = express();

// Security & Body Parser Middlewares with explicit CORS & Cross-Origin Resource Policy
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck Route
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'QRasoi Express Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// Global Error Handler
app.use(errorHandler);
