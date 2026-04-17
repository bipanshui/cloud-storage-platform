import app from "./src/app.js";
import { connectDb, disconnectDb } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import { APP_NAME } from "./src/utils/constants.js";

let server;

/**
 * Starts the HTTP server after a successful database connection.
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    await connectDb();

    server = app.listen(env.port, () => {
      console.log(`${APP_NAME} API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the HTTP server and database connection.
 * @param {NodeJS.Signals} signal
 * @returns {Promise<void>}
 */
async function gracefulShutdown(signal) {
  try {
    console.log(`${signal} received. Shutting down gracefully...`);

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await disconnectDb(signal);
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

void startServer();

