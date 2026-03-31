import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LogParams {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  changes?: Record<string, [unknown, unknown]>;
  ipAddress?: string;
  userAgent?: string;
}

interface FindAllParams {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogParams) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes ? JSON.stringify(params.changes) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  async findAll(params: FindAllParams) {
    const { userId, entityType, entityId, action, from, to, page = 1, limit = 50 } = params;

    const where: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((l: { id: string; userId: string; action: string; entityType: string | null; entityId: string | null; changes: string | null; ipAddress: string | null; userAgent: string | null; createdAt: Date; user: { id: string; name: string; email: string } }) => ({
        ...l,
        changes: l.changes ? JSON.parse(l.changes) : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
