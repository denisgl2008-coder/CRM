import { Router } from 'express';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../controllers/companies.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCompanies);
router.post('/', createCompany);
router.patch('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
