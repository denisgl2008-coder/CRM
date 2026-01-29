import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createLeadSchema = z.object({
    name: z.string().min(1),
    budget: z.number().optional(),
    currency: z.string().default('USD'),
    status: z.string().optional(),
    contactId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional().nullable(),
});

const updateLeadSchema = z.object({
    name: z.string().optional(),
    budget: z.number().optional(),
    status: z.string().optional(),
    assignedTo: z.string().uuid().optional().nullable(),
    contactId: z.string().uuid().optional(),
});

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const getLeads = async (req: AuthRequest, res: Response) => {
    try {
        const leads = await prisma.lead.findMany({
            where: {
                workspaceId: req.user?.workspaceId,
            },
            include: {
                contact: { include: { company: true } }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map currentStageId to status for frontend compatibility
        const mappedLeads = leads.map(lead => ({
            ...lead,
            status: lead.currentStageId || lead.status
        }));

        res.json(mappedLeads);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createLead = async (req: AuthRequest, res: Response) => {
    try {
        const data = createLeadSchema.parse(req.body);

        let leadData: any = {
            ...data,
            workspaceId: req.user!.workspaceId,
            createdBy: req.user!.userId,
        };

        // Handle Status vs StageId mapping
        if (data.status && isUUID(data.status)) {
            leadData.currentStageId = data.status;
            leadData.status = 'active'; // Default DB status
        }

        const lead = await prisma.lead.create({
            data: leadData,
        });

        // System Note: Creation
        try {
            await prisma.note.create({
                data: {
                    content: 'Lead creado',
                    type: 'creation',
                    leadId: lead.id,
                    workspaceId: req.user!.workspaceId,
                    createdBy: req.user!.userId
                }
            });
            // ... (rest of logging logic)


            const fieldLabels: Record<string, string> = {
                name: 'Nombre',
                budget: 'Presupuesto',
                status: 'Estado',
                assignedTo: 'Usuario Asignado',
                currency: 'Moneda'
            };

            const initialLogs = [];
            for (const key of Object.keys(data)) {
                const typedKey = key as keyof typeof data;
                let value = data[typedKey];

                if (value !== undefined && value !== null && value !== '') {
                    const label = fieldLabels[key] || key;

                    if (key === 'assignedTo' && typeof value === 'string') {
                        const user = await prisma.user.findUnique({ where: { id: value } });
                        if (user) value = user.name;
                    } else if (key === 'status' && typeof value === 'string' && isUUID(value)) {
                        const stage = await prisma.pipelineStage.findUnique({ where: { id: value }, select: { name: true } });
                        if (stage) value = stage.name;
                    }

                    initialLogs.push(`El valor del campo «${label}» se establece en «${value}»`);
                }
            }

            if (initialLogs.length > 0) {
                await prisma.note.createMany({
                    data: initialLogs.map(log => ({
                        content: log,
                        type: 'creation',
                        leadId: lead.id,
                        workspaceId: req.user!.workspaceId,
                        createdBy: req.user!.userId
                    }))
                });
            }

        } catch (logError) {
            console.error('Failed to log creation note:', logError);
        }

        res.status(201).json(lead);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateLeadSchema.parse(req.body);

        const lead = await prisma.lead.findFirst({
            where: { id, workspaceId: req.user?.workspaceId },
            include: { currentStage: true }
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        let updateData: any = { ...data };

        // Handle Status vs StageId mapping
        if (data.status && isUUID(data.status)) {
            updateData.currentStageId = data.status;
            // Only force status to active if it's currently a closed status, or just leave it?
            // Usually if moving stages, we imply it's active.
            updateData.status = 'active';
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: updateData,
        });

        // Detect changes and log
        const changes = [];
        const fieldLabels: Record<string, string> = {
            name: 'Nombre',
            budget: 'Presupuesto',
            status: 'Estado',
            assignedTo: 'Usuario Asignado',
            contactId: 'Contacto',
        };

        for (const key of Object.keys(data)) {
            const typedKey = key as keyof typeof data;
            // Use type assertion to access dynamic property safely
            // Normalize values for comparison
            let val1 = (lead as any)[typedKey];
            let val2 = data[typedKey];

            // Treat null and undefined as equivalent
            if (val1 === null) val1 = undefined;
            if (val2 === null) val2 = undefined;

            // Special handling for Status (compare against currentStageId if UUID)
            if (key === 'status') {
                if (isUUID(String(val2))) {
                    // Compare against currentStageId for UUID-based stages
                    if (val2 === lead.currentStageId) continue;
                } else {
                    // Compare against status string for legacy/other
                    if (val1 === val2) continue;
                }
            }
            // Special handling for numeric fields (Budget)
            else if (key === 'budget') {
                const num1 = val1 ? Number(val1) : 0;
                const num2 = val2 ? Number(val2) : 0;
                if (num1 === num2) continue;
            }
            // Strict equality for other fields
            else {
                if (val1 === val2) continue;
            }

            if (val2 !== undefined) {
                const label = fieldLabels[key] || key;
                let displayValue: any = val2;

                if (key === 'assignedTo' && typeof val2 === 'string') {
                    const user = await prisma.user.findUnique({ where: { id: val2 } });
                    if (user) displayValue = user.name;
                } else if (key === 'assignedTo' && val2 === null) {
                    displayValue = 'Sin asignar';
                } else if (key === 'status' && typeof val2 === 'string' && isUUID(val2)) {
                    // Custom logging for stage change
                    const newStage = await prisma.pipelineStage.findUnique({ where: { id: val2 }, select: { name: true } });
                    const newStageName = newStage ? newStage.name : 'Desconocido';

                    const oldStageName = lead.currentStage?.name || lead.status || 'Sin estado';

                    changes.push(`Nuevo estatus: ${newStageName} de ${oldStageName}`);
                    continue; // Skip generic logging
                } else if (key === 'contactId' && typeof val2 === 'string') {
                    const contact = await prisma.contact.findUnique({
                        where: { id: val2 },
                        include: { company: true }
                    });
                    if (contact) {
                        displayValue = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
                        // Optional: Log company if implicitly linked
                        if (contact.company) {
                            changes.push(`La compañía asociada es «${contact.company.name}» (vía contacto)`);
                        }
                    }
                }

                changes.push(`El valor del campo «${label}» se establece en «${displayValue}»`);
            }
        }

        if (changes.length > 0) {
            try {
                await prisma.note.createMany({
                    data: changes.map(change => ({
                        content: change,
                        type: 'update',
                        leadId: lead.id,
                        workspaceId: req.user!.workspaceId,
                        createdBy: req.user!.userId
                    }))
                });
            } catch (logError) {
                console.error('Failed to log update notes:', logError);
            }
        }

        res.json(updatedLead);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const deleteLead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const lead = await prisma.lead.findUnique({
            where: { id, workspaceId: req.user?.workspaceId },
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        await prisma.lead.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
