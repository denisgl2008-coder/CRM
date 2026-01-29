import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createCompanySchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    address: z.string().optional(),
    assignedTo: z.string().optional(),
});

export const getCompanies = async (req: AuthRequest, res: Response) => {
    try {
        const companies = await prisma.company.findMany({
            where: {
                workspaceId: req.user?.workspaceId,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { name: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } }
            }
        });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCompany = async (req: AuthRequest, res: Response) => {
    try {
        const data = createCompanySchema.parse(req.body);
        const company = await prisma.company.create({
            data: {
                ...data,
                workspaceId: req.user!.workspaceId,
                createdBy: req.user!.userId,
            },
        });

        // System Note: Creation (Best Effort)
        try {
            // Check if prisma.note exists (safeguard for potentially stale client)
            if ((prisma as any).note) {
                // Initial creation note
                await prisma.note.create({
                    data: {
                        content: 'Compañía creada',
                        type: 'creation',
                        companyId: company.id,
                        workspaceId: req.user!.workspaceId,
                        createdBy: req.user!.userId
                    }
                });

                // Log initial field values
                const fieldLabels: Record<string, string> = {
                    name: 'Nombre',
                    email: 'Correo',
                    phone: 'Teléfono',
                    website: 'Web',
                    industry: 'Industria',
                    address: 'Dirección'
                };

                const initialLogs = [];
                for (const key of Object.keys(data)) {
                    const typedKey = key as keyof typeof data;
                    const value = data[typedKey];

                    if (value) {
                        const label = fieldLabels[key] || key;
                        initialLogs.push(`El valor del campo «${label}» se establece en «${value}»`);
                    }
                }

                if (initialLogs.length > 0) {
                    await prisma.note.createMany({
                        data: initialLogs.map(log => ({
                            content: log,
                            type: 'creation',
                            companyId: company.id,
                            workspaceId: req.user!.workspaceId,
                            createdBy: req.user!.userId
                        }))
                    });
                }
            }
        } catch (logError) {
            console.error('Failed to log creation note:', logError);
            // Do not fail the request if logging fails
        }

        res.status(201).json(company);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCompanySchema = createCompanySchema.partial();

export const updateCompany = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateCompanySchema.parse(req.body);

        // check if exists and belongs to workspace
        const existing: any = await prisma.company.findFirst({
            where: {
                id,
                workspaceId: req.user?.workspaceId
            }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const company = await prisma.company.update({
            where: { id },
            data: {
                ...data,
            }
        });

        // Detect changes and log
        const changes = [];
        const fieldLabels: Record<string, string> = {
            name: 'Nombre',
            email: 'Correo',
            phone: 'Teléfono',
            website: 'Web',
            industry: 'Industria',
            address: 'Dirección'
        };

        for (const key of Object.keys(data)) {
            const typedKey = key as keyof typeof data;
            const oldValue = existing[typedKey];
            const newValue = data[typedKey];

            if (oldValue !== newValue && newValue !== undefined) {
                const label = fieldLabels[key] || key;
                changes.push(`El valor del campo «${label}» se establece en «${newValue}»`);
            }
        }

        if (changes.length > 0) {
            try {
                if ((prisma as any).note) {
                    await prisma.note.createMany({
                        data: changes.map(change => ({
                            content: change,
                            type: 'update',
                            companyId: company.id,
                            workspaceId: req.user!.workspaceId,
                            createdBy: req.user!.userId
                        }))
                    });
                }
            } catch (logError) {
                console.error('Failed to log update notes:', logError);
            }
        }

        res.json(company);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const company = await prisma.company.findFirst({
            where: {
                id,
                workspaceId: req.user?.workspaceId
            }
        });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        await prisma.company.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
