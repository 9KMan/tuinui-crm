import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'], // all permissions
  MANAGER: ['contacts:*', 'companies:*', 'deals:*', 'tasks:*', 'events:*', 'notes:*', 'files:*', 'reports:read'],
  USER: ['contacts:read', 'contacts:write', 'companies:read', 'deals:read', 'deals:write', 'tasks:write', 'events:write', 'notes:write', 'files:write'],
  VIEWER: ['contacts:read', 'companies:read', 'deals:read', 'tasks:read', 'events:read', 'notes:read'],
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const count = await this.prisma.role.count();
    if (count > 0) return;

    for (const [name, permissions] of Object.entries(DEFAULT_PERMISSIONS)) {
      await this.prisma.role.create({
        data: { name, permissions: JSON.stringify(permissions), isDefault: name === 'USER' },
      });
    }
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: { _count: { select: { users: true } } },
    });
    return roles.map(r => ({
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return {
      ...role,
      permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions,
    };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Role '${dto.name}' already exists`);

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: JSON.stringify(dto.permissions),
      },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    const data: { description?: string; permissions?: string } = { ...dto };
    if (dto.permissions) data.permissions = JSON.stringify(dto.permissions);
    return this.prisma.role.update({ where: { id }, data });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role._count.users > 0) throw new ConflictException('Cannot delete role with assigned users');
    return this.prisma.role.delete({ where: { id } });
  }
}
