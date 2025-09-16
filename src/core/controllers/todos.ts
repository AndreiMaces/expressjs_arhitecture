import { Router } from 'express';
import { TodosService } from '../services/todos.service';

const router = Router();

// GET /api/todos - Get all todo items for the authenticated user
router.get('/', TodosService.getAllTodos);

// GET /api/todos/:id - Get a specific todo item for the authenticated user
router.get('/:id', TodosService.getTodoById);

// POST /api/todos - Create a new todo item for the authenticated user
router.post('/', TodosService.createTodo);

// PUT /api/todos/:id - Update a todo item for the authenticated user
router.put('/:id', TodosService.updateTodo);

// DELETE /api/todos/:id - Delete a todo item for the authenticated user
router.delete('/:id', TodosService.deleteTodo);

export default router;
