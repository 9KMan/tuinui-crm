import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  private generateKey(): { key: string; prefix: string; hash: string } {
    const key = `crm_sk_${randomBytes(16).toString('hex')}`;
    const prefix = key.slice(0, 12);
    const hash = createHash('sha256').update(key).digest('hex');
    return { key, prefix, hash };
  }

  async create(dto: CreateApiKeyDto, userId: string) {
    const { key, prefix, hash } = this.generateKey();
    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        keyHash: hash,
        prefix,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById: userId,
      },
    });
    // Return the plain key ONLY on creation — can't retrieve it again
    return { ...apiKey, key }; // key is the plain text, keyHash never stored in plain
  }

  async findAll(userId?: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: userId ? { createdById: userId } : {},
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    // Never return keyHash to client
    return keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
      createdBy: k.createdBy,
    }));
  }

  async findOne(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException(`ApiKey ${id} not found`);
    return {
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    };
  }

  async remove(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException(`ApiKey ${id} not found`);
    return this.prisma.apiKey.delete({ where: { id } });
  }

  async validate(key: string): Promise<{ valid: boolean; userId?: string }> {
    const hash = createHash('sha256').update(key).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({ where: { keyHash: hash } });
    if (!apiKey) return { valid: false };
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return { valid: false };

    // Update lastUsedAt
    await this.prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
    return { valid: true, userId: apiKey.createdById };
  }
}
