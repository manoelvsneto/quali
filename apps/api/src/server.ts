import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: env.nodeEnv === 'production' ? false : '*',
  credentials: true,
  exposedHeaders: ['Content-Range', 'Content-Length', 'Content-Type'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP',
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.debug({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDatabase();
    
    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
