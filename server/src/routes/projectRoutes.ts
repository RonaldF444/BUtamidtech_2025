import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// Create a new project (Admins only)
router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await prisma.project.create({
            data: { name, description }
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: "Error creating project" });
    }
});

// Get all projects (Anyone)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: "Error fetching projects" });
    }
});

// Get a single project by ID (Anyone)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.id) }
        });
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Error fetching project" });
    }
});

// Update a project (Admins only)
router.patch("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await prisma.project.update({
            where: { id: Number(req.params.id) },
            data: { name, description }
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Error updating project" });
    }
});

// Delete a project (Admins only)
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        await prisma.project.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting project" });
    }
});

export default router;
