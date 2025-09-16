import { Router } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();

// Register endpoint
router.post('/register', AuthService.register);

// Login endpoint
router.post('/login', AuthService.login);

export default router;