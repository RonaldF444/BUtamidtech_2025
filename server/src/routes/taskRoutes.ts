import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// Create a task
router.post("/:projectId/tasks", authMiddleware, async (req, res) => {
    try {
        const { title, description, due_date } = req.body;
        const task = await prisma.tasks.create({
            data: {
                title,
                description,
                project_id: Number(req.params.projectId),
                due_date: due_date ? new Date(due_date) : null,
                status: "pending"
            }
        });
        res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Error creating task" });
    }
});

// Get all tasks for a project
router.get("/:projectId/tasks", authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.tasks.findMany({
            where: { 
                project_id: Number(req.params.projectId) 
            },
            include: {
                projects: true // Include project details if needed
            }
        });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Error fetching tasks" });
    }
});

// Update a task
router.put("/:projectId/tasks/:taskId", authMiddleware, async (req, res) => {
    try {
        const { title, description, status, due_date } = req.body;
        const task = await prisma.tasks.update({
            where: {
                id: Number(req.params.taskId)
            },
            data: {
                title,
                description,
                status,
                due_date: due_date ? new Date(due_date) : undefined
            }
        });
        res.json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Error updating task" });
    }
});

// Delete a task
router.delete("/:projectId/tasks/:taskId", authMiddleware, async (req, res) => {
    try {
        await prisma.tasks.delete({
            where: {
                id: Number(req.params.taskId)
            }
        });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Error deleting task" });
    }
});

export default router;