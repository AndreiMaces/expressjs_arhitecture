import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import controllersRouter from './core/controllers';
import { error404 } from './core/middleware/error404';
import { error500 } from './core/middleware/error500';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', controllersRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    res: 'Hello World'
  });
});

// 404 handler - must be before error500 middleware
app.use('*', error404);

// Error handling middleware - must be last
app.use(error500);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Todo List API available at http://localhost:${PORT}`);
});

export default app;
