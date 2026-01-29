import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;

        // 1. Total Leads (Active)
        const totalLeads = await prisma.lead.count({
            where: {
                workspaceId,
                status: 'active'
            }
        });

        // 2. Pipeline Value (Sum of budget for active leads)
        const pipelineValueResult = await prisma.lead.aggregate({
            where: {
                workspaceId,
                status: 'active'
            },
            _sum: {
                budget: true
            }
        });
        const pipelineValue = pipelineValueResult._sum.budget || 0;

        // 3. Active Tasks (Pending)
        const activeTasks = await prisma.task.count({
            where: {
                workspaceId,
                status: 'pending'
            }
        });

        // 4. Tasks due today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasksDueToday = await prisma.task.count({
            where: {
                workspaceId,
                status: 'pending',
                dueDate: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // 5. Recent Activity (Last 5 leads created)
        const recentActivity = await prisma.lead.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                creator: {
                    select: { name: true }
                }
            }
        });

        res.json({
            totalLeads,
            pipelineValue,
            activeTasks,
            tasksDueToday,
            recentActivity
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};
