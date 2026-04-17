import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected.");
});

/**
 * Connects the application to MongoDB using mongoose.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDb() {
  try {
    return await mongoose.connect(env.mongodbUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error.message);
    throw error;
  }
}

/**
 * Closes the MongoDB connection.
 * @param {string} [reason="Application shutdown"]
 * @returns {Promise<void>}
 */
export async function disconnectDb(reason = "Application shutdown") {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.log(`MongoDB connection closed: ${reason}`);
}
