import { Request, Response } from 'express';
import { TodoRepository } from '../repositories/todo.repository';
import { ResponseHelper } from '../utils/response.util';
import { formatValidationErrors } from '../utils/validation.util';
import { todoValidationSchema } from '../validation/todo.validation';

export class TodosService {
  static async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const todos = await TodoRepository.findAllByUserId(req.user!.userId);
      ResponseHelper.ok(res, todos, req);
    } catch (error) {
      console.error('Error fetching todos:', error);
      ResponseHelper.internalError(res, 'Failed to fetch todos', req);
    }
  }

  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await TodoRepository.findById(parseInt(id), req.user!.userId);

      if (!todo) {
        ResponseHelper.notFound(res, 'Todo item not found', req);
        return;
      }

      ResponseHelper.ok(res, todo, req);
    } catch (error) {
      console.error('Error fetching todo:', error);
      ResponseHelper.internalError(res, 'Failed to fetch todo', req);
    }
  }

  static async createTodo(req: Request, res: Response): Promise<void> {
    try {
      // Validate input using Zod schema
      const validationResult = todoValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = formatValidationErrors(validationResult.error);
        ResponseHelper.badRequest(res, errors, req);
        return;
      }

      const { title, description } = validationResult.data;
      const { checked } = req.body;

      const todo = await TodoRepository.create({
        title,
        description: description || null,
        checked: checked || false,
        userId: req.user!.userId
      });

      ResponseHelper.created(res, todo, req);
    } catch (error) {
      console.error('Error creating todo:', error);
      ResponseHelper.internalError(res, 'Failed to create todo', req);
    }
  }

  static async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, checked } = req.body;

      // Validate only the fields that are being updated using partial schema
      const validationResult = todoValidationSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = formatValidationErrors(validationResult.error);
        ResponseHelper.badRequest(res, errors, req);
        return;
      }

      const todo = await TodoRepository.update(parseInt(id), req.user!.userId, { title, description, checked });

      ResponseHelper.ok(res, todo, req);
    } catch (error) {
      console.error('Error updating todo:', error);
      if (error instanceof Error && error.message === 'Todo item not found or does not belong to user') {
        ResponseHelper.notFound(res, 'Todo item not found', req);
        return;
      }
      ResponseHelper.internalError(res, 'Failed to update todo', req);
    }
  }

  static async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await TodoRepository.delete(parseInt(id), req.user!.userId);

      ResponseHelper.noContent(res, req);
    } catch (error) {
      console.error('Error deleting todo:', error);
      if (error instanceof Error && error.message === 'Todo item not found or does not belong to user') {
        ResponseHelper.notFound(res, 'Todo item not found', req);
        return;
      }
      ResponseHelper.internalError(res, 'Failed to delete todo', req);
    }
  }
}
