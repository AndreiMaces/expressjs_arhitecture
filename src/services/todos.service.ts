import { Request, Response } from 'express';
import { TodoRepository } from '../repositories/todo.repository';

export class TodosService {
  static async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const todos = await TodoRepository.findAllByUserId(req.user!.userId);
      res.json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await TodoRepository.findById(parseInt(id), req.user!.userId);

      if (!todo) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }

      res.json(todo);
    } catch (error) {
      console.error('Error fetching todo:', error);
      res.status(500).json({ error: 'Failed to fetch todo' });
    }
  }

  static async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, checked } = req.body;

      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const todo = await TodoRepository.create({
        title,
        description: description || null,
        checked: checked || false,
        userId: req.user!.userId
      });

      res.status(201).json(todo);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  }

  static async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, checked } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (checked !== undefined) updateData.checked = checked;

      const todo = await TodoRepository.update(parseInt(id), req.user!.userId, updateData);

      res.json(todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      if (error instanceof Error && error.message === 'Todo item not found or does not belong to user') {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update todo' });
    }
  }

  static async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await TodoRepository.delete(parseInt(id), req.user!.userId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting todo:', error);
      if (error instanceof Error && error.message === 'Todo item not found or does not belong to user') {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  }
}
