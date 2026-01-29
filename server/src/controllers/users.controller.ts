import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                workspaceId: req.user?.workspaceId,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
