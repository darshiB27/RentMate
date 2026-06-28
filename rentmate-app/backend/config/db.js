import mongoose from 'mongoose';
import logger from './logger.js';
import env from './env.js';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 2000; // 2 seconds

const connectDB = async (retryCount = 1) => {
  try {
    const connectionInstance = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10, // Limit maximum database connection pool size
    });
    logger.info(`MongoDB Connected successfully! DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection failure (Attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
    
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_BACKOFF * Math.pow(2, retryCount - 1); // Exponential backoff scaling
      logger.info(`Retrying MongoDB connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    } else {
      logger.error('Failed to establish MongoDB connection after maximum retries. Terminating startup...');
      throw error;
    }
  }
};

export default connectDB;
