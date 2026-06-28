import cron from 'node-cron';
import { compileDailyMetrics } from '../services/analytics.service.js';
import logger from './logger.js';

/**
 * Initializes all background scheduled cron jobs.
 */
export const initCronJobs = () => {
  logger.info('Initializing background scheduled cron jobs...');

  // 1. Daily Analytics Materialization Job
  // Scheduled to execute daily at midnight (00:00 UTC)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Executing scheduled daily analytics compilation cron job...');
    try {
      await compileDailyMetrics();
      logger.info('Daily analytics cron job completed successfully.');
    } catch (error) {
      logger.error(`Error in scheduled daily analytics compilation cron job: ${error.message}`);
    }
  });

  logger.info('All scheduled cron jobs registered successfully.');
};

export default initCronJobs;
