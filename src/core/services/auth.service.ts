import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.util';
import { UserRepository } from '../repositories/user.repository';
import { ResponseHelper } from '../utils/response.util';
import bcrypt from 'bcrypt';

export class AuthService {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Basic validation
      if (!username || !password) {
        ResponseHelper.badRequest(res, 'Username and password are required');
        return;
      }

      // Check if user already exists
      const userExists = await UserRepository.exists(username);

      if (userExists) {
        ResponseHelper.conflict(res, 'Username already exists');
        return;
      }

      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user with hashed password
      const user = await UserRepository.create({
        username,
        password: hashedPassword
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username
      });

      ResponseHelper.created(res, {
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      ResponseHelper.internalError(res, 'Internal server error');
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Basic validation
      if (!username || !password) {
        ResponseHelper.badRequest(res, 'Username and password are required');
        return;
      }

      // Find user by username
      const user = await UserRepository.findByUsername(username);

      if (!user) {
        ResponseHelper.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        ResponseHelper.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username
      });

      ResponseHelper.ok(res, {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      ResponseHelper.internalError(res, 'Internal server error');
    }
  }
}