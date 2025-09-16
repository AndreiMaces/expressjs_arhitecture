import { PrismaClient, TodoListItem } from '@prisma/client';

const prisma = new PrismaClient();

export class TodoRepository {
  static async findById(id: number, userId: number): Promise<TodoListItem | null> {
    return await prisma.todoListItem.findFirst({
      where: { 
        id,
        userId
      }
    });
  }

  static async findAllByUserId(userId: number): Promise<TodoListItem[]> {
    return await prisma.todoListItem.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async create(data: {
    title: string;
    description?: string | null;
    checked?: boolean;
    userId: number;
  }): Promise<TodoListItem> {
    return await prisma.todoListItem.create({
      data
    });
  }

  static async update(id: number, userId: number, data: Partial<{
    title: string;
    description: string | null;
    checked: boolean;
  }>): Promise<TodoListItem> {
    // First verify the todo belongs to the user
    const existingTodo = await this.findById(id, userId);
    if (!existingTodo) {
      throw new Error('Todo item not found or does not belong to user');
    }

    return await prisma.todoListItem.update({
      where: { id },
      data
    });
  }

  static async delete(id: number, userId: number): Promise<void> {
    // First verify the todo belongs to the user
    const existingTodo = await this.findById(id, userId);
    if (!existingTodo) {
      throw new Error('Todo item not found or does not belong to user');
    }

    await prisma.todoListItem.delete({
      where: { id }
    });
  }

  static async findAll(): Promise<TodoListItem[]> {
    return await prisma.todoListItem.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async exists(id: number, userId: number): Promise<boolean> {
    const todo = await prisma.todoListItem.findFirst({
      where: { 
        id,
        userId
      },
      select: { id: true }
    });
    return todo !== null;
  }

  static async countByUserId(userId: number): Promise<number> {
    return await prisma.todoListItem.count({
      where: {
        userId
      }
    });
  }

  static async findCheckedByUserId(userId: number): Promise<TodoListItem[]> {
    return await prisma.todoListItem.findMany({
      where: {
        userId,
        checked: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async findUncheckedByUserId(userId: number): Promise<TodoListItem[]> {
    return await prisma.todoListItem.findMany({
      where: {
        userId,
        checked: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
