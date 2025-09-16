import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  static async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  static async create(data: {
    username: string;
    password: string;
  }): Promise<User> {
    return await prisma.user.create({
      data
    });
  }

  static async update(id: number, data: Partial<{
    username: string;
    password: string;
  }>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: number): Promise<User> {
    return await prisma.user.delete({
      where: { id }
    });
  }

  static async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async exists(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });
    return user !== null;
  }
}
