import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createContactSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    position: z.string().optional(),
    companyId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
});

export const getContacts = async (req: AuthRequest, res: Response) => {
    try {
        const contacts = await prisma.contact.findMany({
            where: {
                workspaceId: req.user?.workspaceId,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { name: true }
                },
                company: {
                    select: { name: true }
                },
                assignee: {
                    select: { id: true, name: true, avatarUrl: true }
                }
            }
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createContact = async (req: AuthRequest, res: Response) => {
    try {
        const data = createContactSchema.parse(req.body);
        const contact = await prisma.contact.create({
            data: {
                ...data,
                workspaceId: req.user!.workspaceId,
                createdBy: req.user!.userId,
            },
        });

        // System Note: Creation (Best Effort)
        try {
            if ((prisma as any).note) {
                // Initial creation note
                await prisma.note.create({
                    data: {
                        content: 'Contacto creado',
                        type: 'creation',
                        contactId: contact.id,
                        workspaceId: req.user!.workspaceId,
                        createdBy: req.user!.userId
                    }
                });

                // Log initial field values
                const fieldLabels: Record<string, string> = {
                    firstName: 'Nombre',
                    lastName: 'Apellido',
                    email: 'Correo',
                    phone: 'Teléfono',
                    position: 'Cargo',
                    companyId: 'Compañía'
                };

                const initialLogs = [];
                for (const key of Object.keys(data)) {
                    const typedKey = key as keyof typeof data;
                    let value = data[typedKey];

                    if (value) { // Only log provided values
                        const label = fieldLabels[key] || key;

                        // If it's companyId, we've already fetched the contact with company included? 
                        // Actually create returns the contact. Let's fetch the company name if needed or rely on a separate query if strictly necessary 
                        // but deeper: `contact` from prisma.contact.create usually just returns the model fields unless we used include.
                        // We didn't use include above.

                        // To allow logging the Name, we need to fetch it if key is companyId.
                        // However, strictly doing await inside this loop is fine for just one field.
                        if (key === 'companyId' && typeof value === 'string') {
                            const company = await prisma.company.findUnique({ where: { id: value } });
                            if (company) value = company.name;
                        }

                        initialLogs.push(`El valor del campo «${label}» se establece en «${value}»`);
                    }
                }

                if (initialLogs.length > 0) {
                    await prisma.note.createMany({
                        data: initialLogs.map(log => ({
                            content: log,
                            type: 'creation', // or 'update' if you prefer distinct style, but 'creation' fits the event
                            contactId: contact.id,
                            workspaceId: req.user!.workspaceId,
                            createdBy: req.user!.userId
                        }))
                    });
                }
            }
        } catch (logError) {
            console.error('Failed to log creation note:', logError);
        }

        res.status(201).json(contact);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateContact = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = createContactSchema.partial().parse(req.body);

        // Get existing contact to compare
        const existingContact: any = await prisma.contact.findUnique({
            where: { id, workspaceId: req.user!.workspaceId }
        });

        if (!existingContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        const contact = await prisma.contact.update({
            where: {
                id,
                workspaceId: req.user!.workspaceId
            },
            data
        });

        // Detect changes and log
        const changes = [];
        const fieldLabels: Record<string, string> = {
            firstName: 'Nombre',
            lastName: 'Apellido',
            email: 'Correo',
            phone: 'Teléfono',
            position: 'Cargo',
            companyId: 'Compañía'
        };

        for (const key of Object.keys(data)) {
            const typedKey = key as keyof typeof data;
            const oldValue = existingContact[typedKey];
            const newValue = data[typedKey];

            if (oldValue !== newValue && newValue !== undefined) {
                const label = fieldLabels[key] || key;
                let displayValue = newValue;

                if (key === 'companyId' && typeof newValue === 'string') {
                    const company = await prisma.company.findUnique({ where: { id: newValue } });
                    if (company) displayValue = company.name;
                }

                changes.push(`El valor del campo «${label}» se establece en «${displayValue}»`);
            }
        }

        if (changes.length > 0) {
            try {
                if ((prisma as any).note) {
                    await prisma.note.createMany({
                        data: changes.map(change => ({
                            content: change,
                            type: 'update',
                            contactId: contact.id,
                            workspaceId: req.user!.workspaceId,
                            createdBy: req.user!.userId
                        }))
                    });
                }
            } catch (logError) {
                console.error('Failed to log update notes:', logError);
            }
        }

        res.json(contact);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteContact = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const contact = await prisma.contact.findUnique({
            where: { id, workspaceId: req.user?.workspaceId },
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await prisma.contact.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
