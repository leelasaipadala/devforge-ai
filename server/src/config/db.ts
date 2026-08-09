import mongoose from 'mongoose';
import { config } from './env.js';

export let isMongoConnected = false;
let memoryServerInstance: any = null;

export const connectDB = async () => {
  mongoose.set('strictQuery', false);

  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
    console.log('[Database] MongoDB connection established successfully.');
  });

  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('[Database] MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    isMongoConnected = false;
    console.error(`[Database Error] MongoDB connection error: ${err.message}`);
  });

  // TIER 1: Try Primary MongoDB URI (from environment / Atlas)
  if (config.mongoUri && !config.mongoUri.includes('<username>')) {
    try {
      console.log('[Database] Attempting primary MongoDB connection...');
      const conn = await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 5000,
      });
      isMongoConnected = true;
      console.log(`[Database] Connected to Primary MongoDB host: ${conn.connection.host}`);
      return;
    } catch (primaryErr: any) {
      console.warn(`[Database Warning] Primary MongoDB connection failed (${primaryErr?.message || primaryErr}). Falling back to secondary...`);
    }
  }

  // TIER 2: Try Local MongoDB instance (mongodb://127.0.0.1:27017/devforge-ai)
  const localUri = 'mongodb://127.0.0.1:27017/devforge-ai';
  if (config.mongoUri !== localUri) {
    try {
      console.log('[Database] Attempting local MongoDB connection (127.0.0.1:27017)...');
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongoConnected = true;
      console.log(`[Database] Connected to Local MongoDB host: ${conn.connection.host}`);
      return;
    } catch (localErr: any) {
      console.warn('[Database Warning] Local MongoDB unavailable. Launching In-Memory MongoDB Server fallback...');
    }
  }

  // TIER 3: Fall back to MongoDB Memory Server (Always succeeds & ensures zero downtime)
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = memoryServerInstance.getUri();

    const conn = await mongoose.connect(memoryUri);
    isMongoConnected = true;
    console.log(`[Database] Connected to In-Memory MongoDB Server: ${conn.connection.host}`);
  } catch (memErr: any) {
    console.error('[Database Error] Failed to start In-Memory MongoDB Server:', memErr?.message || memErr);
    isMongoConnected = false;
  }
};
