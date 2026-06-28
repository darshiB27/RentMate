import mongoose from 'mongoose';
import logger from './config/logger.js';

// 1. Trap uncaught exceptions at startup before loading modules
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Shutting down server immediately...', err);
  process.exit(1);
});

import env from './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';
import { verifyMailConnection } from './config/nodemailer.js';
import { initSocketServer } from './socket/socketServer.js';
import initCronJobs from './config/cron.js';



const PORT = env.PORT;
let server;

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown sequence...`);

  // Force termination after 10 seconds if cleanup tasks hang
  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out! Forcing process termination...');
    process.exit(1);
  }, 10000);

  if (server) {
    server.close(async () => {
      logger.info('HTTP Server listener closed. Rejecting all new incoming requests.');

      try {
        // Disconnect Mongoose pool connection
        await mongoose.connection.close(false);
        logger.info('MongoDB database connection terminated cleanly.');
        
        clearTimeout(forceExitTimeout);
        logger.info('Graceful shutdown completed successfully. Exiting.');
        process.exit(0);
      } catch (error) {
        logger.error('Error encountered while disconnecting MongoDB connection:', error);
        clearTimeout(forceExitTimeout);
        process.exit(1);
      }
    });
  } else {
    clearTimeout(forceExitTimeout);
    process.exit(0);
  }
};

// 2. Connect to Database first, then spin up the HTTP Listener
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server is running in ${env.NODE_ENV} mode on port ${PORT}`);
      // Perform mail SMTP diagnostic check on startup
      verifyMailConnection();
    });
    initSocketServer(server);
    initCronJobs();


  })
  .catch((err) => {
    logger.error('Database connection failed! Server initialization aborted.', err);
    process.exit(1);
  });

// 3. Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection! Triggering process termination...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// 4. Bind termination signals for containerized scaling (like Docker/Kubernetes)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
