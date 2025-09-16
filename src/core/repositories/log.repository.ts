import { PrismaClient, Log } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateLogData {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: string;
  userId?: number;
}

export class LogRepository {
  static async create(data: CreateLogData): Promise<Log> {
    return await prisma.log.create({
      data: {
        level: data.level,
        message: data.message,
        context: data.context,
        userId: data.userId
      }
    });
  }

  static async findById(id: number): Promise<Log | null> {
    return await prisma.log.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  static async findByUserId(userId: number, limit: number = 100): Promise<Log[]> {
    return await prisma.log.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  static async findByLevel(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', limit: number = 100): Promise<Log[]> {
    return await prisma.log.findMany({
      where: { level },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  static async findAll(limit: number = 100, offset: number = 0): Promise<Log[]> {
    return await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  static async deleteOldLogs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  static async count(): Promise<number> {
    return await prisma.log.count();
  }
}
