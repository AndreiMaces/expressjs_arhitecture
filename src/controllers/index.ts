import { Router } from 'express';
import todosRouter from './todos';
import authRouter from './auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Mount all controllers
router.use('/todos', authenticateToken, todosRouter);
router.use('/auth', authRouter);

// Add more controllers here in the future
// router.use('/users', usersRouter);
// etc.

export default router;
