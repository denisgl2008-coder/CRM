import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/products.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.post('/', createProduct);

export default router;
