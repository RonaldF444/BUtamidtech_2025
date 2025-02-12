import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

// Import your routes
import projectRoutes from "./routes/projectRoutes"; 
import taskRoutes from "./routes/taskRoutes"; 
import authRoutes from "./routes/authRoutes"; // ✅ Import authentication routes

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Register Authentication Routes
app.use("/api/auth", authRoutes);

// ✅ Register API routes
app.use("/api/projects", projectRoutes);
app.use("/api/projects", taskRoutes); // ✅ Mount task routes correctly under /api/projects

// ✅ Test database connection route
app.get("/api/test", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "Database connected successfully" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
