
import { Router } from 'express';
import { getPipeline, savePipeline } from '../controllers/pipelines.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getPipeline);
router.post('/', savePipeline);

export default router;
