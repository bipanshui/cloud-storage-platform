import mongoose from "mongoose";
import { env } from "./env.js";

let isReconnecting = false;

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully.");
  isReconnecting = false;
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
  if (!isReconnecting) {
    isReconnecting = true;
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) {
        mongoose.connect(env.mongodbUri).catch(() => {
          console.error("Reconnection failed");
        });
      }
    }, 3000);
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected.");
  if (!isReconnecting) {
    isReconnecting = true;
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) {
        mongoose.connect(env.mongodbUri).catch(() => {
          console.error("Reconnection failed");
        });
      }
    }, 3000);
  }
});

export async function connectDb() {
  try {
    return await mongoose.connect(env.mongodbUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error.message);
    throw error;
  }
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

setInterval(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.command({ ping: 1 });
    } catch (_error) {}
  }
}, 30000);
