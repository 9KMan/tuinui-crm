import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete helper
  async softDelete<T extends { update: Function }>(
    model: any,
    where: Record<string, any>,
  ): Promise<T> {
    return model.update({
      where,
      data: { deletedAt: new Date() },
    });
  }
}
