import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Register endpoint
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      res.status(400).json({
        error: 'Username and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Username already exists'
      });
      return;
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with hashed password
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      res.status(400).json({
        error: 'Username and password are required'
      });
      return;
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;