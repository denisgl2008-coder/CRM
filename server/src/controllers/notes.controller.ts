import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createNoteSchema = z.object({
    content: z.string().min(1),
    contactId: z.string().uuid().optional(),
    leadId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional(),
});

export const getNotes = async (req: AuthRequest, res: Response) => {
    try {
        const { contactId, leadId, companyId } = req.query;

        const whereClause: any = {
            workspaceId: req.user?.workspaceId,
        };

        if (contactId) whereClause.contactId = contactId;
        if (leadId) whereClause.leadId = leadId;
        if (companyId) whereClause.companyId = companyId;

        const notes = await prisma.note.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true, avatarUrl: true }
                }
            }
        });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createNote = async (req: AuthRequest, res: Response) => {
    try {
        const data = createNoteSchema.parse(req.body);

        const note = await prisma.note.create({
            data: {
                ...data,
                workspaceId: req.user!.workspaceId,
                createdBy: req.user!.userId,
            },
            include: {
                author: {
                    select: { name: true, avatarUrl: true }
                }
            }
        });

        res.status(201).json(note);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
