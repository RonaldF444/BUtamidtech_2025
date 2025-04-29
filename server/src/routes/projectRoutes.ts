import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/roleMiddleware";

// Interface for authenticated request
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

const router = express.Router();
const prisma = new PrismaClient();

// Create a new project - only admins can create projects
router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req: AuthRequest, res: Response) => {
  try {
    console.log("Creating project, request body:", req.body);
    console.log("User making request:", req.user);
    
    const { name, description } = req.body;
    
    if (!name) {
      console.log("Project creation failed: Name is required");
      return res.status(400).json({ error: "Project name is required" });
    }
    
    const project = await prisma.projects.create({
      data: { 
        name, 
        description: description || null 
      }
    });
    
    console.log("Project created successfully:", project);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: "Error creating project", 
        details: error.message,
        type: error.constructor.name
      });
    } else {
      res.status(500).json({ 
        error: "Error creating project", 
        details: "Unknown error occurred"
      });
    }
  }
});

// Get all projects - all authenticated users can view projects
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log("Fetching all projects, user ID:", req.user?.id);
    
    const projects = await prisma.projects.findMany({
      include: {
        tasks: true // Include the related tasks
      }
    });
    
    console.log(`Found ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Error fetching projects", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get a single project by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    console.log(`Fetching project ID: ${projectId}, user ID: ${req.user?.id}`);
    
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        tasks: true // Include the related tasks
      }
    });
    
    if (!project) {
      console.log(`Project ID ${projectId} not found`);
      return res.status(404).json({ error: "Project not found" });
    }
    
    console.log(`Found project: ${project.name}`);
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Error fetching project", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update a project - only admins can update projects
router.patch("/:id", authMiddleware, roleMiddleware(["admin"]), async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    console.log(`Updating project ID: ${projectId}, user role: ${req.user?.role}`);
    
    const { name, description } = req.body;
    
    // Check if project exists first
    const existingProject = await prisma.projects.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const project = await prisma.projects.update({
      where: { id: projectId },
      data: { 
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined
      }
    });
    
    console.log(`Project ID ${projectId} updated successfully`);
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Error updating project", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Delete a project - only admins can delete projects
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    console.log(`Deleting project ID: ${projectId}, user role: ${req.user?.role}`);
    
    // Check if project exists first
    const existingProject = await prisma.projects.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    await prisma.projects.delete({
      where: { id: projectId }
    });
    
    console.log(`Project ID ${projectId} deleted successfully`);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Error deleting project", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;