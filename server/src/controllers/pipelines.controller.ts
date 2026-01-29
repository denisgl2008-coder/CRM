
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPipeline = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        console.log('getPipeline called by user:', userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const pipeline = await prisma.pipeline.findFirst({
            where: { workspaceId: user.workspaceId },
            include: {
                stages: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });

        res.json(pipeline);
    } catch (error) {
        console.error('Error fetching pipeline:', error);
        res.status(500).json({ message: 'Error fetching pipeline' });
    }
};

export const savePipeline = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { stages, templateName } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find or Create Pipeline
        let pipeline = await prisma.pipeline.findFirst({
            where: { workspaceId: user.workspaceId }
        });

        if (!pipeline) {
            pipeline = await prisma.pipeline.create({
                data: {
                    workspaceId: user.workspaceId,
                    name: 'Sales Pipeline',
                    templateType: templateName || 'Personalizado'
                }
            });
        } else {
            await prisma.pipeline.update({
                where: { id: pipeline.id },
                data: { templateType: templateName || 'Personalizado' }
            });
        }

        const pipelineId = pipeline.id;

        // Transaction to replace stages
        await prisma.$transaction(async (tx) => {
            // 1. Get current stages to identify what to delete
            const currentStages = await tx.pipelineStage.findMany({
                where: { pipelineId: pipelineId },
                select: { id: true }
            });
            const currentStageIds = currentStages.map(s => s.id);

            // 2. Identify incoming stages
            const stagesToKeepIds: string[] = [];

            if (stages && stages.length > 0) {
                for (let i = 0; i < stages.length; i++) {
                    const stage = stages[i];
                    // Check if it's an existing UUID (simple regex or length check)
                    const isExistingString = typeof stage.id === 'string' && stage.id.length > 20 && !stage.id.startsWith('new-stage');

                    if (isExistingString && currentStageIds.includes(stage.id)) {
                        // UPDATE existing stage
                        stagesToKeepIds.push(stage.id);
                        await tx.pipelineStage.update({
                            where: { id: stage.id },
                            data: {
                                name: stage.title,
                                orderIndex: i,
                                color: stage.color || 'border-gray-400',
                                bgColor: stage.bgColor || 'bg-gray-50'
                            }
                        });
                    } else {
                        // CREATE new stage
                        await tx.pipelineStage.create({
                            data: {
                                id: isExistingString ? stage.id : undefined,
                                pipelineId: pipelineId,
                                name: stage.title,
                                type: 'stage',
                                orderIndex: i,
                                color: stage.color || 'border-gray-400',
                                bgColor: stage.bgColor || 'bg-gray-50'
                            }
                        });
                    }
                }
            }

            // 3. Delete stages that are not in the new list
            const stagesToDelete = currentStageIds.filter(id => !stagesToKeepIds.includes(id));
            if (stagesToDelete.length > 0) {
                await tx.pipelineStage.deleteMany({
                    where: {
                        id: { in: stagesToDelete },
                        pipelineId: pipelineId // Security double-check
                    }
                });
            }
        });

        const updatedPipeline = await prisma.pipeline.findUnique({
            where: { id: pipelineId },
            include: { stages: { orderBy: { orderIndex: 'asc' } } }
        });

        res.json(updatedPipeline);

    } catch (error) {
        console.error('Error saving pipeline:', error);
        res.status(500).json({ message: 'Error saving pipeline' });
    }
};
