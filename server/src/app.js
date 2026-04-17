import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { generalRateLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(generalRateLimiter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
  });
});

app.use("/api/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(errorHandler);

export default app;

