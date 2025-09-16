import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Todo Routes
// GET /api/todos - Get all todo items
app.get('/api/todos', async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todoListItem.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET /api/todos/:id - Get a specific todo item
app.get('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await prisma.todoListItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo item not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
  return;
});

// POST /api/todos - Create a new todo item
app.post('/api/todos', async (req: Request, res: Response) => {
  try {
    const { title, description, checked } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = await prisma.todoListItem.create({
      data: {
        title,
        description: description || null,
        checked: checked || false
      }
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
  return;
});

// PUT /api/todos/:id - Update a todo item
app.put('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, checked } = req.body;

    // Check if todo exists
    const existingTodo = await prisma.todoListItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo item not found' });
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
  return;
});

// DELETE /api/todos/:id - Delete a todo item
app.delete('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if todo exists
    const existingTodo = await prisma.todoListItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo item not found' });
    }

    await prisma.todoListItem.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
  return;
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    res: 'Hello World'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Todo List API available at http://localhost:${PORT}`);
});

export default app;
