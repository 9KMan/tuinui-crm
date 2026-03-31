import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWebhookDto, userId?: string) {
    const secret = dto.secret || randomBytes(32).toString('hex');
    return this.prisma.webhook.create({
      data: { name: dto.name, url: dto.url, secret, events: dto.events, headers: dto.headers ? JSON.stringify(dto.headers) : undefined, createdById: userId },
    });
  }

  async findAll(activeOnly?: boolean) {
    return this.prisma.webhook.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const w = await this.prisma.webhook.findUnique({ where: { id } });
    if (!w) throw new NotFoundException(`Webhook ${id} not found`);
    return w;
  }

  async update(id: string, dto: Partial<CreateWebhookDto>) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.headers) data.headers = JSON.stringify(dto.headers);
    return this.prisma.webhook.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.webhook.delete({ where: { id } });
  }

  async toggle(id: string) {
    const w = await this.findOne(id);
    return this.prisma.webhook.update({
      where: { id },
      data: { isActive: !w.isActive },
    });
  }

  async deliver(id: string, payload: Record<string, unknown>) {
    const w = await this.findOne(id);
    if (!w.isActive) return { skipped: true, reason: 'Webhook inactive' };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-ID': w.id,
    };
    if (w.secret) headers['X-Webhook-Signature'] = w.secret; // simplified

    try {
      const res = await fetch(w.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return { success: res.ok, status: res.status };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMessage };
    }
  }
}
