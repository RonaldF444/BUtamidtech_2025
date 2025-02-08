import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// Create a task (Only assigned users)
router.post("/:projectId/tasks", authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId: Number(req.params.projectId)
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Error creating task" });
    }
});

// Get all tasks for a project (Anyone in the project)
router.get("/:projectId/tasks", authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId: Number(req.params.projectId) }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
});

export default router;
