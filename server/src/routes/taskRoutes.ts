import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware, trackMiddleware } from "../middleware/roleMiddleware";
import { ROLE_PERMISSIONS } from "../middleware/roleMiddleware";

type RoleTypes = 'president' | 'director' | 'pm' | 'member' | 'client';

// Interface for authenticated request
interface AuthRequest extends Request {
  user?: {
    user_id: number;
    role: RoleTypes;
    track: string;
  };
}

const router = express.Router();
const prisma = new PrismaClient();

// Create a task
router.post("/:projectId/tasks", 
  authMiddleware, 
  roleMiddleware(["canManageTrackProjects"]),
  trackMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, due_date } = req.body;
      const projectId = Number(req.params.projectId);

      if (!title || !projectId) {
        return res.status(400).json({ error: 'Title and project ID are required' });
      }

      // Check if project exists and user has permission
      const project = await prisma.projects.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user has access to the project
      if (req.user?.role !== 'president' && project.track !== req.user?.track) {
        return res.status(403).json({ error: "You don't have permission to add tasks to this project" });
      }

      const task = await prisma.tasks.create({
        data: {
          title,
          description,
          project_id: projectId,
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
router.patch("/:projectId/tasks/:taskId", 
  authMiddleware, 
  roleMiddleware(["canManageTrackProjects"]),
  trackMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, status, due_date } = req.body;
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);

      // Check if project exists and user has permission
      const project = await prisma.projects.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user has access to the project
      if (req.user?.role !== 'president' && project.track !== req.user?.track) {
        return res.status(403).json({ error: "You don't have permission to update tasks in this project" });
      }

      // Check if user has permission to complete tasks
      if (status === "completed" && req.user?.role && !ROLE_PERMISSIONS[req.user.role].canCompleteProjects) {
        return res.status(403).json({ error: "You don't have permission to complete tasks" });
      }

      const task = await prisma.tasks.update({
        where: { id: taskId },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          status: status !== undefined ? status : undefined,
          due_date: due_date !== undefined ? new Date(due_date) : undefined
        }
      });
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Error updating task" });
    }
});

// Delete a task
router.delete("/:projectId/tasks/:taskId", 
  authMiddleware, 
  roleMiddleware(["canManageTrackProjects"]),
  trackMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const projectId = Number(req.params.projectId);
      const taskId = Number(req.params.taskId);

      // Check if project exists and user has permission
      const project = await prisma.projects.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (req.user?.role !== 'president' && project.track !== req.user?.track) {
        return res.status(403).json({ error: "You don't have permission to delete tasks from this project" });
      }

      await prisma.tasks.delete({
        where: { id: taskId }
      });
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Error deleting task" });
    }
});

export default router;