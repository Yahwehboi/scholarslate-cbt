import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { db } from "./db/connection.js";
import { seedDefaultAdmin } from "./db/seed.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { studentsRouter } from "./routes/students.js";
import { subjectsRouter } from "./routes/subjects.js";
import { questionsRouter } from "./routes/questions.js";

const app = express();

// Initialize DB and seed on startup.
void db;
seedDefaultAdmin().catch((err) => {
  console.error("[SEED] Failed to seed default admin:", err);
});

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
app.use("/api/auth", authRouter);
app.use("/api/students", studentsRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/questions", questionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
