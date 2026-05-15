import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

export const connectDB = async () => {
  try {
    const dbUrl = process.env.DB_URL;

    if (!dbUrl) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    // Disable buffering to fail fast instead of waiting
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', false);

    const options = {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(dbUrl, options);

    console.log("✅ MongoDB Connected Successfully");

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};
