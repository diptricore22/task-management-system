import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from '@/config/env';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/middlewares/error.middleware';

// Import route modules
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/users/user.routes';
import projectRoutes from '@/modules/projects/projects.routes';
import projectTaskRoutes from '@/modules/tasks/tasks.routes';
import taskRoutes from '@/modules/tasks/tasks.individual.routes';
// ... other route imports

export function createApp(): express.Application {
  const app = express();

  // Trust proxy for accurate client IP addresses
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: [
      config.app.frontendUrl,
      'http://localhost:3000', // Development frontend
      'http://localhost:3001', // Alternative frontend port
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie'],
  }));

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parsing middleware
  app.use(cookieParser());

  // Request logging
  const morganFormat = config.app.isDevelopment ? 'dev' : 'combined';
  app.use(morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));

  // Rate limiting
  if (config.app.isProduction) {
    const limiter = rateLimit({
      windowMs: config.security.rateLimit.windowMs,
      max: config.security.rateLimit.max,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.app.env,
        version: '1.0.0',
      },
    });
  });

  // API routes
  app.use('/api', (req, _res, next) => {
    // Log all API requests
    logger.info(`API Request: ${req.method} ${req.originalUrl}`);
    next();
  });

  // Mount route modules
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/projects/:projectId/tasks', projectTaskRoutes);
  app.use('/api/tasks', taskRoutes);
  // app.use('/api/assignments', assignmentRoutes);
  // app.use('/api/dashboard', dashboardRoutes);
  // app.use('/api/comments', commentRoutes);
  // app.use('/api/labels', labelRoutes);
  // app.use('/api/notifications', notificationRoutes);
  // app.use('/api/kanban', kanbanRoutes);
  // app.use('/api/reports', reportRoutes);

  // Placeholder API endpoint for testing
  app.get('/api/test', (_req, res) => {
    res.json({
      success: true,
      data: {
        message: 'API is working!',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      code: 'NOT_FOUND',
    });
  });

  // 404 handler for all other routes
  app.use('*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;
