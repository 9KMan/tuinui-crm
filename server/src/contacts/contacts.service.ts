import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { LinkedEntityType, ActivityType } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async findAll(params: {
    search?: string;
    companyId?: string;
    take?: number;
    skip?: number;
  }) {
    const { search, companyId, take = 50, skip = 0 } = params;

    const where: any = { deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { activities: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: true,
        createdBy: { select: { id: true, name: true, email: true } },
        activities: {
          where: { deletedAt: null },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async create(dto: CreateContactDto, userId: string) {
    const contact = await this.prisma.contact.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Auto-log activity
    await this.activitiesService.log({
      type: ActivityType.CREATE,
      userId,
      linkedType: LinkedEntityType.CONTACT,
      linkedId: contact.id,
      subject: `Contact "${contact.name}" created`,
      contactId: contact.id,
    });

    return contact;
  }

  async update(id: string, dto: UpdateContactDto, userId: string) {
    const existing = await this.prisma.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Contact not found');
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: dto,
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    // Auto-log activity
    await this.activitiesService.log({
      type: ActivityType.UPDATE,
      userId,
      linkedType: LinkedEntityType.CONTACT,
      linkedId: contact.id,
      subject: `Contact "${contact.name}" updated`,
      contactId: contact.id,
    });

    return contact;
  }

  async remove(id: string, userId: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Soft delete
    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Auto-log activity
    await this.activitiesService.log({
      type: ActivityType.DELETE,
      userId,
      linkedType: LinkedEntityType.CONTACT,
      linkedId: id,
      subject: `Contact "${contact.name}" deleted`,
      contactId: id,
    });

    return { message: 'Contact deleted successfully' };
  }

  async getActivities(id: string, params: { take?: number; skip?: number }) {
    const contact = await this.prisma.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.activitiesService.findAll({
      linkedType: 'CONTACT',
      linkedId: id,
      take: params.take,
      skip: params.skip,
    });
  }

  async search(query: string, take = 20) {
    return this.prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        company: { select: { id: true, name: true } },
      },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
