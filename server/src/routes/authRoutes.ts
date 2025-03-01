import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Type for Prisma error
interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
  };
}

// Register a new user
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, password, role, username, track = "education" } = req.body;
        console.log("Registration attempt:", { email, username, role, track });
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { 
                email, 
                password: hashedPassword, 
                role: role || "user", 
                username,
                track
            }
        });

        console.log("User created successfully with ID:", user.user_id);
        res.status(201).json({ message: "User created successfully" });
    } catch (error: unknown) {
        console.error("Registration error:", error);
        
        // Check for specific error types
        if (error instanceof Error) {
            const prismaError = error as PrismaError;
            if (prismaError.code === 'P2002') {
                // This is a unique constraint violation
                const field = prismaError.meta?.target?.[0] || 'field';
                return res.status(400).json({ 
                    error: `The ${field} is already taken.`,
                    details: `A user with this ${field} already exists.`
                });
            }
            
            res.status(500).json({ 
                error: "Error registering user", 
                details: prismaError.message 
            });
        } else {
            res.status(500).json({ 
                error: "Error registering user", 
                details: "An unknown error occurred" 
            });
        }
    }
});

// Login an existing user
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email);

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            console.log("Login failed: User not found");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Login failed: Password doesn't match");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role }, 
            SECRET_KEY, 
            { expiresIn: "1h" }
        );
        
        console.log("Login successful for user ID:", user.user_id);
        res.json({ token });
    } catch (error: unknown) {
        console.error("Login error:", error);
        if (error instanceof Error) {
            res.status(500).json({ 
                error: "Error logging in", 
                details: error.message 
            });
        } else {
            res.status(500).json({ 
                error: "Error logging in", 
                details: "An unknown error occurred" 
            });
        }
    }
});

// Get current user profile
router.get("/profile", async (req: Request, res: Response) => {
    try {
        // Extract user ID from token
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided" });
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number };
        
        const user = await prisma.users.findUnique({
            where: { user_id: decoded.id },
            select: {
                user_id: true,
                username: true,
                email: true,
                role: true,
                track: true,
                created_at: true
            }
        });
        
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.json({ user });
    } catch (error: unknown) {
        console.error("Profile fetch error:", error);
        if (error instanceof Error) {
            res.status(500).json({ 
                error: "Error fetching profile", 
                details: error.message 
            });
        } else {
            res.status(500).json({ 
                error: "Error fetching profile", 
                details: "An unknown error occurred" 
            });
        }
    }
});

export default router;