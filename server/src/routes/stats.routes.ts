import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware'; // Assuming this middleware exists

const router = Router();

router.use(authenticate);

router.get('/', getDashboardStats);

export default router;
