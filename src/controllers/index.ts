import { Router } from 'express';
import todosRouter from './todos';

const router = Router();

// Mount all controllers
router.use('/todos', todosRouter);

// Add more controllers here in the future
// router.use('/users', usersRouter);
// router.use('/auth', authRouter);
// etc.

export default router;
