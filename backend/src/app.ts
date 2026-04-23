import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { db } from "./db/connection.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";

const app = express();

// Initialize DB on startup to fail fast when configuration is invalid.
void db;

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "1mb" }));

app.use("/api", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
