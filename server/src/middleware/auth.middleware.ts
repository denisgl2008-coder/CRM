import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        workspaceId: string;
        email: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.user = {
            userId: payload.userId,
            workspaceId: payload.workspaceId,
            email: payload.email,
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
