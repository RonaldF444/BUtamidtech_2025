import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Interface to extend Request with user property
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Type for Prisma error
interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
  };
}

// Authentication middleware
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No authorization header found");
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, SECRET_KEY) as { id: number, role: string };
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Register a new user
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, password, role, username, track = "education" } = req.body;
        console.log("Registration attempt:", { email, username, role, track });
        
        // Store password as plain text (temporarily)
        const user = await prisma.users.create({
            data: { 
                email, 
                password: password, // No hashing
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

        // Compare passwords directly (no hashing)
        if (password !== user.password) {
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
router.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        console.log("Profile request received, user ID:", req.user?.id);
        
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                username: true,
                email: true,
                role: true,
                track: true,
                created_at: true
            }
        });
        
        if (!user) {
            console.log(`User with ID ${userId} not found in database`);
            return res.status(404).json({ message: "User not found" });
        }
        
        console.log("User profile fetched successfully:", user.user_id);
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