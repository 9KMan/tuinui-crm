import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomFieldDto, UpdateCustomFieldDto } from './dto';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomFieldDto) {
    // Check for duplicate name+entityType
    const existing = await this.prisma.customField.findFirst({
      where: { name: dto.name, entityType: dto.entityType }
    });
    if (existing) {
      throw new ConflictException(`Field '${dto.name}' already exists for ${dto.entityType}`);
    }

    return this.prisma.customField.create({
      data: {
        ...dto,
        options: dto.options ? JSON.stringify(dto.options) : null,
      },
    });
  }

  async findAll(entityType?: string) {
    return this.prisma.customField.findMany({
      where: entityType ? { entityType, visible: true } : {},
      orderBy: [{ entityType: 'asc' }, { position: 'asc' }],
    });
  }

  async findOne(id: string) {
    const field = await this.prisma.customField.findUnique({ where: { id } });
    if (!field) throw new NotFoundException(`CustomField ${id} not found`);
    return field;
  }

  async update(id: string, dto: UpdateCustomFieldDto) {
    await this.findOne(id); // validate
    return this.prisma.customField.update({
      where: { id },
      data: {
        ...dto,
        options: dto.options ? JSON.stringify(dto.options) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Delete all values for this field first
    await this.prisma.customFieldValue.deleteMany({ where: { fieldId: id } });
    return this.prisma.customField.delete({ where: { id } });
  }

  // --- Value management ---
  async setValues(entityType: string, entityId: string, values: Record<string, unknown>) {
    // Upsert values for each field
    const fieldIds = Object.keys(values);
    if (fieldIds.length === 0) return;

    for (const [fieldId, value] of Object.entries(values)) {
      await this.prisma.customFieldValue.upsert({
        where: {
          entityType_entityId_fieldId: { entityType, entityId, fieldId }
        },
        create: { entityType, entityId, fieldId, value },
        update: { value },
      });
    }
  }

  async getValues(entityType: string, entityId: string): Promise<Record<string, unknown>> {
    const values = await this.prisma.customFieldValue.findMany({
      where: { entityType, entityId },
    });
    return values.reduce<Record<string, unknown>>((acc, v) => ({ ...acc, [v.fieldId]: v.value }), {});
  }
}
