import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead } from '../controllers/leads.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getLeads);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
