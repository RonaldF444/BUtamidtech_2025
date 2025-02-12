import { Request, Response, NextFunction } from "express";

// ✅ Extend Express Request type
interface AuthenticatedRequest extends Request {
    user?: { role?: string }; // Define user with role
}

export const roleMiddleware = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient Permissions" });
        }
        next();
    };
};
