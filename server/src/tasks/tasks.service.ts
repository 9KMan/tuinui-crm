import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    assignedToId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }) {
    const {
      page = 1,
      limit = 50,
      status,
      assignedToId,
      dueDateFrom,
      dueDateTo,
    } = params;
    const take = limit;
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (assignedToId) where.assigneeId = assignedToId;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) (where.dueDate as Record<string, unknown>).gte = new Date(dueDateFrom);
      if (dueDateTo) (where.dueDate as Record<string, unknown>).lte = new Date(dueDateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id, deletedAt: null },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(dto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: dto,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return task;
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Task deleted successfully' };
  }
}
