import mongoose from 'mongoose';
import logger from '../config/logger.js';

/**
 * Shared Mongoose Transaction Execution Utility.
 *
 * Detects whether the active MongoDB connection is part of a Replica Set.
 * - If YES → runs workFn inside a full ACID transaction session.
 * - If NO and NODE_ENV is not 'production' → falls back to standalone execution
 *   (no session), logging a warning. This prevents crashes during local development
 *   where standalone MongoDB instances do not support multi-document transactions.
 *
 * Usage:
 * ```js
 * import executeTransaction from '../utils/executeTransaction.js';
 *
 * const result = await executeTransaction(async (session) => {
 *   const doc = await MyModel.create([data], { session });
 *   await AnotherModel.findByIdAndUpdate(id, update, { session });
 *   return doc;
 * });
 * ```
 *
 * @param {Function} workFn - Async function receiving (session | null) as its argument.
 *                            When session is null (standalone fallback), all Mongoose
 *                            operations should still accept { session } without error.
 * @returns {Promise<any>} - Resolves with the return value of workFn.
 * @throws {Error} - Re-throws any error from workFn after aborting the transaction.
 */
const executeTransaction = async (workFn) => {
  const conn = mongoose.connection;

  // Detect Replica Set availability: replicaSet config key, replicaPort, or multiple hosts
  const isReplicaSet =
    conn.config?.replicaSet ||
    conn.replicaPort ||
    (Array.isArray(conn.hosts) && conn.hosts.length > 1);

  // --- Standalone Fallback (local dev only) ---
  if (!isReplicaSet && process.env.NODE_ENV !== 'production') {
    logger.warn(
      '[Transaction] Standalone MongoDB detected. Multi-document transaction bypassed for local development. ' +
      'Deploy with a Replica Set or MongoDB Atlas for full ACID guarantees.'
    );
    return await workFn(null);
  }

  // --- Full Transaction Path (Replica Set / Production) ---
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await workFn(session);
    await session.commitTransaction();
    logger.debug('[Transaction] Transaction committed successfully.');
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`[Transaction] Transaction aborted due to error: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

export default executeTransaction;
