import { Request, Response, NextFunction } from "express";

// Define role types
type RolePermissions = {
    canManageRoles: boolean;
    canManageAllProjects: boolean;
    canManageTrackProjects: boolean;
    canCompleteProjects: boolean;
    canViewAll: boolean;
};

type RoleTypes = 'president' | 'director' | 'pm' | 'member' | 'client';

// ✅ Extend Express Request type
interface AuthenticatedRequest extends Request {
    user?: { 
        role?: RoleTypes;
        track?: string;
    };
}

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<RoleTypes, RolePermissions> = {
    president: {
        canManageRoles: true,
        canManageAllProjects: true,
        canManageTrackProjects: true,
        canCompleteProjects: true,
        canViewAll: true
    },
    director: {
        canManageRoles: false,
        canManageAllProjects: false,
        canManageTrackProjects: true,
        canCompleteProjects: true,
        canViewAll: true
    },
    pm: {
        canManageRoles: false,
        canManageAllProjects: false,
        canManageTrackProjects: true,
        canCompleteProjects: false,
        canViewAll: true
    },
    member: {
        canManageRoles: false,
        canManageAllProjects: false,
        canManageTrackProjects: false,
        canCompleteProjects: false,
        canViewAll: false
    },
    client: {
        canManageRoles: false,
        canManageAllProjects: false,
        canManageTrackProjects: false,
        canCompleteProjects: false,
        canViewAll: false
    }
};

// Helper function to check if user has required permissions
const hasRequiredPermissions = (userRole: string, requiredPermissions: string[]): boolean => {
    const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    if (!userPermissions) return false;
    
    return requiredPermissions.every(permission => userPermissions[permission as keyof typeof userPermissions]);
};

// Middleware to check role-based permissions
export const roleMiddleware = (requiredPermissions: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Forbidden: No role specified" });
        }

        if (!hasRequiredPermissions(req.user.role, requiredPermissions)) {
            return res.status(403).json({ message: "Forbidden: Insufficient Permissions" });
        }

        next();
    };
};

// Middleware to check track-based permissions
export const trackMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const userTrack = req.user?.track;
    const projectTrack = req.body.track || req.query.track;

    if (!userRole || !userTrack) {
        return res.status(403).json({ message: "Forbidden: No role or track specified" });
    }

    const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    
    // President can access all tracks
    if (userRole === 'president') {
        return next();
    }

    // Director and PM can only access their own track
    if ((userRole === 'director' || userRole === 'pm') && userTrack === projectTrack) {
        return next();
    }

    // Member and Client can only view their own track
    if ((userRole === 'member' || userRole === 'client') && userTrack === projectTrack) {
        return next();
    }

    return res.status(403).json({ message: "Forbidden: Insufficient Track Permissions" });
};
