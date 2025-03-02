import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Extend Express Request type to include `user`
interface AuthenticatedRequest extends Request {
    user?: any; // Change `any` to your actual user type if available
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
