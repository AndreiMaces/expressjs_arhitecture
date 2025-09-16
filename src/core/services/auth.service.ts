import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.util';
import { UserRepository } from '../repositories/user.repository';
import { ResponseHelper } from '../utils/response.util';
import { formatValidationErrors } from '../utils/validation.util';
import { registerValidationSchema, loginValidationSchema } from '../validation/auth.validation';
import { Logger } from '../utils/logger.util';
import bcrypt from 'bcrypt';

export class AuthService {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input using Zod schema
      const validationResult = registerValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = formatValidationErrors(validationResult.error);
        ResponseHelper.badRequest(res, errors, req);
        return;
      }

      const { username, password } = validationResult.data;

      // Check if user already exists
      const userExists = await UserRepository.exists(username);

      if (userExists) {
        ResponseHelper.conflict(res, 'Username already exists', req);
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

      // Log successful registration
      await Logger.logAuth('register', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      ResponseHelper.created(res, {
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      }, req);
    } catch (error) {
      console.error('Registration error:', error);
      await Logger.error('Registration failed', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      ResponseHelper.internalError(res, 'Internal server error', req);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input using Zod schema
      const validationResult = loginValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = formatValidationErrors(validationResult.error);
        ResponseHelper.badRequest(res, errors, req);
        return;
      }

      const { username, password } = validationResult.data;

      // Find user by username
      const user = await UserRepository.findByUsername(username);

      if (!user) {
        await Logger.logAuth('auth_failed', undefined, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          reason: 'User not found'
        });
        ResponseHelper.unauthorized(res, 'Invalid credentials', req);
        return;
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await Logger.logAuth('auth_failed', user.id, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          reason: 'Invalid password'
        });
        ResponseHelper.unauthorized(res, 'Invalid credentials', req);
        return;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username
      });

      // Log successful login
      await Logger.logAuth('login', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      ResponseHelper.ok(res, {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      }, req);
    } catch (error) {
      console.error('Login error:', error);
      await Logger.error('Login failed', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      ResponseHelper.internalError(res, 'Internal server error', req);
    }
  }
}