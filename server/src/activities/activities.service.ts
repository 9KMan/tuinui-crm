import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityType, LinkedEntityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  // ─── Auto-log helper ─────────────────────────────────────

  async log(params: {
    type: ActivityType;
    userId: string;
    linkedType: LinkedEntityType;
    linkedId?: string;
    subject?: string;
    body?: string;
    metadata?: Record<string, any>;
    contactId?: string;
    companyId?: string;
    dealId?: string;
    taskId?: string;
    eventId?: string;
  }) {
    return this.prisma.activity.create({
      data: {
        type: params.type,
        subject: params.subject,
        body: params.body,
        metadata: params.metadata || {},
        userId: params.userId,
        linkedType: params.linkedType,
        linkedId: params.linkedId,
        contactId: params.contactId,
        companyId: params.companyId,
        dealId: params.dealId,
        taskId: params.taskId,
        eventId: params.eventId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  // ─── CRUD ────────────────────────────────────────────────

  async findAll(params: {
    linkedType?: string;
    linkedId?: string;
    userId?: string;
    type?: string;
    take?: number;
    skip?: number;
  }) {
    const { linkedType, linkedId, userId, type, take = 50, skip = 0 } = params;

    const where: any = { deletedAt: null };
    if (linkedType) where.linkedType = linkedType;
    if (linkedId) where.linkedId = linkedId;
    if (userId) where.userId = userId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          contact: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
          deal: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data, total, take, skip };
  }

  async findOne(id: string) {
    return this.prisma.activity.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  }

  async create(dto: CreateActivityDto, userId: string) {
    return this.log({
      type: dto.type as ActivityType,
      userId,
      linkedType: dto.linkedType as LinkedEntityType,
      linkedId: dto.linkedId,
      subject: dto.subject,
      body: dto.body,
      metadata: dto.metadata,
    });
  }
}
