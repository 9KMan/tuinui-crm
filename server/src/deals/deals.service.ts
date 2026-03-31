import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealStage } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    companyId?: string;
    contactId?: string;
    stage?: DealStage;
    createdById?: string;
    pipelineStageId?: string;
    assignedToId?: string;
  }) {
    const { page = 1, limit = 50, companyId, contactId, stage, createdById, pipelineStageId, assignedToId } = params;
    const take = limit;
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (contactId) where.contactId = contactId;
    if (stage) where.stage = stage;
    if (createdById) where.createdById = createdById;
    if (pipelineStageId) where.pipelineStageId = pipelineStageId;
    if (assignedToId) where.assignedToId = assignedToId;

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: true,
        contact: { select: { id: true, name: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { activities: true } },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async create(dto: CreateDealDto, userId: string) {
    const deal = await this.prisma.deal.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return deal;
  }

  async update(id: string, dto: UpdateDealDto) {
    const existing = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    const deal = await this.prisma.deal.update({
      where: { id },
      data: dto,
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    return deal;
  }

  async remove(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id, deletedAt: null },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Deal deleted successfully' };
  }
}
