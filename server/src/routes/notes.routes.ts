import { Router } from 'express';
import { getNotes, createNote } from '../controllers/notes.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotes);
router.post('/', createNote);

export default router;
