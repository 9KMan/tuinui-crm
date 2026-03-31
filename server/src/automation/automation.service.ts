import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationDto } from './dto';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAutomationDto, userId?: string) {
    return this.prisma.automation.create({
      data: {
        name: dto.name,
        description: dto.description,
        triggerType: dto.triggerType,
        triggerConfig: JSON.stringify(dto.triggerConfig),
        conditions: dto.conditions ? JSON.stringify(dto.conditions) : null,
        actions: JSON.stringify(dto.actions),
        isActive: dto.isActive ?? true,
        createdById: userId,
      },
    });
  }

  async findAll(activeOnly?: boolean) {
    return this.prisma.automation.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const a = await this.prisma.automation.findUnique({ where: { id } });
    if (!a) throw new NotFoundException(`Automation ${id} not found`);
    return a;
  }

  async update(id: string, dto: Partial<CreateAutomationDto>) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.triggerConfig) data.triggerConfig = JSON.stringify(dto.triggerConfig);
    if (dto.conditions) data.conditions = JSON.stringify(dto.conditions);
    if (dto.actions) data.actions = JSON.stringify(dto.actions);
    return this.prisma.automation.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.automation.delete({ where: { id } });
  }

  async toggle(id: string) {
    const a = await this.findOne(id);
    return this.prisma.automation.update({
      where: { id },
      data: { isActive: !a.isActive },
    });
  }

  async getLogs(automationId: string, limit = 20) {
    return this.prisma.automationLog.findMany({
      where: { automationId },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
  }

  async triggerTest(id: string, testData?: Record<string, unknown>) {
    const a = await this.findOne(id);
    const start = Date.now();
    try {
      // Placeholder: evaluate conditions + execute actions
      const log = await this.prisma.automationLog.create({
        data: {
          automationId: id,
          triggerData: testData ? JSON.stringify(testData) : null,
          actionsRun: a.actions,
          status: 'SUCCESS',
          durationMs: Date.now() - start,
        },
      });
      await this.prisma.automation.update({
        where: { id },
        data: { lastRunAt: new Date(), runCount: { increment: 1 } },
      });
      return { success: true, logId: log.id };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const log = await this.prisma.automationLog.create({
        data: {
          automationId: id,
          triggerData: testData ? JSON.stringify(testData) : null,
          actionsRun: a.actions,
          status: 'FAILED',
          error: errorMessage,
          durationMs: Date.now() - start,
        },
      });
      return { success: false, logId: log.id, error: errorMessage };
    }
  }
}
