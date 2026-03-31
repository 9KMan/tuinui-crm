import { Test, TestingModule } from '@nestjs/testing';
import { DealsService } from './deals.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DealsService', () => {
  let service: DealsService;
  let prisma: PrismaService;

  const mockPrisma = {
    deal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    pipelineStage: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a deal', async () => {
      const dto = { name: 'Test Deal', amount: 1000 };
      const expected = { id: 'uuid-1', ...dto, stagePosition: 0, closedAt: null, deletedAt: null, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.deal.create.mockResolvedValue(expected);

      const result = await service.create(dto as any);

      expect(result).toEqual(expected);
      expect(mockPrisma.deal.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return paginated deals with meta', async () => {
      const deals = [{ id: '1', name: 'Deal 1' }];
      mockPrisma.deal.findMany.mockResolvedValue(deals);
      mockPrisma.deal.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(deals);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter deletedAt: null', async () => {
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.deal.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20 });

      expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a deal if found', async () => {
      const deal = { id: '1', name: 'Deal 1' };
      mockPrisma.deal.findFirst.mockResolvedValue(deal);

      const result = await service.findOne('1');
      expect(result).toEqual(deal);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updated = { id: '1', name: 'Updated Deal' };
      mockPrisma.deal.update.mockResolvedValue(updated);

      const result = await service.update('1', { name: 'Updated Deal' } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('remove (soft delete)', () => {
    it('should set deletedAt instead of hard delete', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue({ id: '1', deletedAt: null });
      mockPrisma.deal.update.mockResolvedValue({ id: '1', deletedAt: new Date() });

      await service.remove('1');

      expect(mockPrisma.deal.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('should throw NotFoundException if deal not found on remove', async () => {
      mockPrisma.deal.findFirst.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow();
    });
  });
});
