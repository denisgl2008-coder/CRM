import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
    workspaceName: z.string().min(3).trim(),
    email: z.string().email().trim(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    workspaceName: z.string().trim(),
    email: z.string().email().trim(),
    password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { workspaceName, email, password } = registerSchema.parse(req.body);

        // Allow same email in different workspaces, so we don't check global uniqueness anymore.
        // Prisma will handle constraint violation if somehow we try to create duplicate in same workspace.

        const hashedPassword = await bcrypt.hash(password, 10);
        const subdomain = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        // Transaction to create workspace + user
        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    subdomain: subdomain,
                },
            });

            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    name: email.split('@')[0],
                    workspaceId: workspace.id,
                },
            });

            return { workspace, user };
        });

        const token = jwt.sign(
            { userId: result.user.id, workspaceId: result.workspace.id, email: result.user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: { id: result.user.id, email: result.user.email, name: result.user.name },
            workspace: { id: result.workspace.id, name: result.workspace.name }
        });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ message: `Validation failed: ${errorMessage}`, errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { workspaceName, email, password } = loginSchema.parse(req.body);

        // Find all users with this email in workspaces with the given name
        const users = await prisma.user.findMany({
            where: {
                email: email,
                isActive: true,
                workspace: {
                    name: workspaceName
                }
            },
            include: {
                workspace: true
            }
        });

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas (usuario o workspace no encontrado)' });
        }

        // Verify passwords and find the best match (oldest workspace preferred)
        let bestMatch: typeof users[0] | null = null;

        for (const user of users) {
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (isPasswordValid) {
                if (!bestMatch || user.workspace.createdAt < bestMatch.workspace.createdAt) {
                    bestMatch = user;
                }
            }
        }

        if (!bestMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas (contraseña incorrecta)' });
        }

        const user = bestMatch;
        const workspace = user.workspace;

        const token = jwt.sign(
            { userId: user.id, workspaceId: user.workspaceId, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, avatar: user.avatarUrl },
            workspace: { id: workspace.id, name: workspace.name }
        });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ message: `Validation failed: ${errorMessage}`, errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
