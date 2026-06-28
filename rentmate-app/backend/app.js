import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import env from './config/env.js';
import logger from './config/logger.js';
import errorHandler from './middleware/error.middleware.js';
import ApiError from './utils/ApiError.js';
import ApiResponse from './utils/ApiResponse.js';

// Load passport social authentication configuration
import './config/passport.js';

// Load API routes
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/property.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import adminRoutes from './routes/adminRoutes.js';
import searchRoutes from './routes/search.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import chatRoutes from './routes/chatRoutes.js';
import contactRouter from './routes/contact.routes.js';
import { swaggerServe, swaggerSetup } from './config/swagger.js';

const app = express();




// 1. HTTP Security Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 3. Response Compression (Gzip)
app.use(compression());

// 4. Request Payload Parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 5. Cookie Parser
app.use(cookieParser());

// 6. Passport Initialization
app.use(passport.initialize());

// 7. Request Logging (Morgan piped to Winston)
const morganFormat = env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// 8. General API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15-minute window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again later.',
});
app.use('/api/', apiLimiter);

// 9. API Route Definitions
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json(new ApiResponse(200, { status: 'UP' }, 'Server is healthy'));
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/contact', contactRouter);
app.use('/api-docs', swaggerServe, swaggerSetup);




// 10. Catch Non-Existent Routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// 11. Centralized Error Handler (Last in stack)
app.use(errorHandler);

export default app;
