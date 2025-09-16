import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TodosService {
  static async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const todos = await prisma.todoListItem.findMany({
        where: {
          userId: req.user!.userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await prisma.todoListItem.findFirst({
        where: { 
          id: parseInt(id),
          userId: req.user!.userId
        }
      });

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

      const todo = await prisma.todoListItem.create({
        data: {
          title,
          description: description || null,
          checked: checked || false,
          userId: req.user!.userId
        }
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

      // Check if todo exists and belongs to the user
      const existingTodo = await prisma.todoListItem.findFirst({
        where: { 
          id: parseInt(id),
          userId: req.user!.userId
        }
      });

      if (!existingTodo) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (checked !== undefined) updateData.checked = checked;

      const todo = await prisma.todoListItem.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.json(todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Failed to update todo' });
    }
  }

  static async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if todo exists and belongs to the user
      const existingTodo = await prisma.todoListItem.findFirst({
        where: { 
          id: parseInt(id),
          userId: req.user!.userId
        }
      });

      if (!existingTodo) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }

      await prisma.todoListItem.delete({
        where: { id: parseInt(id) }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  }
}
