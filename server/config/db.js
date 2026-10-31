import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB Atlas / local MongoDB instance using Mongoose.
 * Falls back to a local development database when no environment variable is configured.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/solarsphere';

  if (!process.env.MONGO_URI) {
    console.warn('⚠️ [Database Warning] MONGO_URI not found. Using local MongoDB at mongodb://127.0.0.1:27017/solarsphere');
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('connected', () => {
    console.log('📡 [MongoDB Event] Connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`⚠️ [MongoDB Event Error] Runtime issue: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('🔌 [MongoDB Event] Connection disconnected');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 [MongoDB] Connection closed due to application termination');
    process.exit(0);
  });
};

