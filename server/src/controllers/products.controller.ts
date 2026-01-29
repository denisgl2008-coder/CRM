import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createProductSchema = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    category: z.string().optional(),
    stock: z.number().int().min(0).optional(),
});

export const getProducts = async (req: AuthRequest, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                workspaceId: req.user?.workspaceId,
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const data = createProductSchema.parse(req.body);
        const product = await prisma.product.create({
            data: {
                ...data,
                workspaceId: req.user!.workspaceId,
            },
        });
        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
