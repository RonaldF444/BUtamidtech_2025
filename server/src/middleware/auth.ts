import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Define the user type
interface User {
    user_id: number;
    role: string;
    track: string;
}

// Extend Express Request type to include `user`
interface AuthenticatedRequest extends Request {
    user?: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as User;
        if (!decoded.role) {
            return res.status(401).json({ message: "Invalid token: missing role" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};
