import mongoose from 'mongoose';
import { config } from './env.js';

export let isMongoConnected = false;

export const connectDB = async () => {
  try {
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

    if (!config.mongoUri || config.mongoUri.includes('<username>')) {
      console.warn('[Database Notice] MONGODB_URI is unconfigured or contains placeholder values.');
      return;
    }

    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`[Database] Connected to MongoDB Atlas host: ${conn.connection.host}`);
  } catch (error: any) {
    isMongoConnected = false;
    console.error(`[Database Error] Could not connect to MongoDB Atlas: ${error?.message || error}`);
  }
};
