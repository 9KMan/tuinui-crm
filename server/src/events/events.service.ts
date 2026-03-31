import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LinkedEntityType } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    startDateFrom?: string;
    startDateTo?: string;
  }) {
    const { page = 1, limit = 50, startDateFrom, startDateTo } = params;
    const take = limit;
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = { deletedAt: null };

    if (startDateFrom || startDateTo) {
      where.startAt = {};
      if (startDateFrom) {
        (where.startAt as Record<string, unknown>).gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        (where.startAt as Record<string, unknown>).lte = new Date(startDateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { startAt: 'asc' },
        take,
        skip,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(dto: CreateEventDto, userId: string) {
    // Resolve linkedType and linkedId from relation fields
    let linkedType: LinkedEntityType = LinkedEntityType.NONE;
    let linkedId: string | null = null;

    if (dto.contactId) {
      linkedType = LinkedEntityType.CONTACT;
      linkedId = dto.contactId;
    } else if (dto.companyId) {
      linkedType = LinkedEntityType.COMPANY;
      linkedId = dto.companyId;
    } else if (dto.assignedToId) {
      linkedType = LinkedEntityType.EVENT;
      linkedId = dto.assignedToId;
    }

    const data: Record<string, unknown> = {
      title: dto.title,
      startAt: new Date(dto.startDate),
      createdById: userId,
      linkedType,
      linkedId,
    };

    if (dto.description) data.description = dto.description;
    if (dto.endDate) data.endAt = new Date(dto.endDate);
    if (dto.location) data.location = dto.location;

    return this.prisma.event.create({ data });
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startDate !== undefined) data.startAt = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endAt = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.location !== undefined) data.location = dto.location;

    // Update linkedType/linkedId if relation fields change
    if (dto.contactId) {
      data.linkedType = LinkedEntityType.CONTACT;
      data.linkedId = dto.contactId;
    } else if (dto.companyId) {
      data.linkedType = LinkedEntityType.COMPANY;
      data.linkedId = dto.companyId;
    } else if (dto.assignedToId) {
      data.linkedType = LinkedEntityType.EVENT;
      data.linkedId = dto.assignedToId;
    }

    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Event deleted successfully' };
  }
}
