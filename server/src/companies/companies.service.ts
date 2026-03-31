import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { LinkedEntityType, ActivityType } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async findAll(params: {
    search?: string;
    industry?: string;
    size?: string;
    take?: number;
    skip?: number;
  }) {
    const { search, industry, size, take = 50, skip = 0 } = params;

    const where: any = { deletedAt: null };
    if (industry) where.industry = industry;
    if (size) where.size = size;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { contacts: true, deals: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
      include: {
        contacts: {
          where: { deletedAt: null },
          select: { id: true, name: true, email: true, jobTitle: true },
          take: 20,
        },
        deals: {
          where: { deletedAt: null },
          select: { id: true, title: true, amount: true, stage: true },
          take: 20,
        },
        createdBy: { select: { id: true, name: true, email: true } },
        activities: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async create(dto: CreateCompanyDto, userId: string) {
    const company = await this.prisma.company.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    await this.activitiesService.log({
      type: ActivityType.CREATE,
      userId,
      linkedType: LinkedEntityType.COMPANY,
      linkedId: company.id,
      subject: `Company "${company.name}" created`,
      companyId: company.id,
    });

    return company;
  }

  async update(id: string, dto: UpdateCompanyDto, userId: string) {
    const existing = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: dto,
    });

    await this.activitiesService.log({
      type: ActivityType.UPDATE,
      userId,
      linkedType: LinkedEntityType.COMPANY,
      linkedId: company.id,
      subject: `Company "${company.name}" updated`,
      companyId: company.id,
    });

    return company;
  }

  async remove(id: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.activitiesService.log({
      type: ActivityType.DELETE,
      userId,
      linkedType: LinkedEntityType.COMPANY,
      linkedId: id,
      subject: `Company "${company.name}" deleted`,
      companyId: id,
    });

    return { message: 'Company deleted successfully' };
  }

  async search(query: string, take = 20) {
    return this.prisma.company.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { domain: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
