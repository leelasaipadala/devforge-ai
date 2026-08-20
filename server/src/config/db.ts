import mongoose from 'mongoose';
import { config } from './env.js';
import { QuestionModel } from '../models/Question.js';
import { CURATED_QUESTIONS } from '../data/curatedQuestions.js';

export let isMongoConnected = false;
let memoryServerInstance: any = null;

export const seedCuratedQuestions = async () => {
  try {
    const existingCount = await QuestionModel.countDocuments({ isAiGenerated: { $ne: true } });
    if (existingCount < CURATED_QUESTIONS.length) {
      console.log(`[Question Bank] Seeding/Updating ${CURATED_QUESTIONS.length} curated questions into MongoDB...`);
      for (const q of CURATED_QUESTIONS) {
        await QuestionModel.updateOne(
          { id: q.id },
          { $set: { ...q, isAiGenerated: false } },
          { upsert: true }
        );
      }
      console.log('[Question Bank] Curated questions successfully seeded.');
    }
  } catch (err: any) {
    console.warn(`[Question Bank Warning] Failed to seed curated questions: ${err?.message || err}`);
  }
};

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
      await seedCuratedQuestions();
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
      await seedCuratedQuestions();
      return;
    } catch (localErr: any) {
      console.warn('[Database Warning] Local MongoDB unavailable. Launching In-Memory MongoDB Server fallback...');
    }
  }

  // TIER 3: Fall back to MongoDB Memory Server (Development ONLY to prevent OOM on free hosts)
  if (config.nodeEnv === 'production') {
    console.error('[Database Fatal] All database connections failed in production. Memory Server fallback is disabled to prevent memory limits.');
    return;
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = memoryServerInstance.getUri();

    const conn = await mongoose.connect(memoryUri);
    isMongoConnected = true;
    console.log(`[Database] Connected to In-Memory MongoDB Server: ${conn.connection.host}`);
    await seedCuratedQuestions();
  } catch (memErr: any) {
    console.error('[Database Error] Failed to start In-Memory MongoDB Server:', memErr?.message || memErr);
    isMongoConnected = false;
  }
};
