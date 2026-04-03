import { PrismaClient } from '@prisma/client';
import { config } from '@/config/env';

// PrismaClient singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: config.app.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

if (config.app.env !== 'production') globalForPrisma.prisma = prisma;

// Helper function to handle soft deletes
export function excludeDeleted<T extends Record<string, any>>(
  where: T = {} as T
): T & { deleted_at: null } {
  return {
    ...where,
    deleted_at: null,
  };
}

// Helper function for pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

export function getPaginationParams(options: PaginationOptions) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(Math.max(1, options.limit ?? 20), 100);
  const skip = options.skip ?? (page - 1) * limit;
  const take = options.take ?? limit;

  return { page, limit, skip, take };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// Graceful disconnect
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;