import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB Atlas / local MongoDB instance using Mongoose.
 * Reads the connection URI strictly from environment variables without hardcoding credentials.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/solarsphere';

  if (!uri) {
    console.error('❌ [Database Error] MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production', // disable autoIndex build in production for performance
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging indefinitely
    });

    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }

  // Monitor connection events for runtime health
  mongoose.connection.on('connected', () => {
    console.log('📡 [MongoDB Event] Connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`⚠️ [MongoDB Event Error] Runtime issue: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('🔌 [MongoDB Event] Connection disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 [MongoDB] Connection closed due to application termination');
    process.exit(0);
  });
};

