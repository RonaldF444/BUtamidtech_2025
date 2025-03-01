import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

// Import your routes
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middleware/auth";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/projects", authMiddleware, projectRoutes);
app.use("/api/projects", authMiddleware, taskRoutes);

// Test database connection route
app.get("/api/test", async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.json({ message: "Database connected successfully" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Server error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing HTTP server and disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});