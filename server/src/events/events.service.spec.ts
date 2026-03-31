import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const dto = { title: 'Team Meeting', startDate: new Date() };
      const expected = { id: 'uuid-1', ...dto, description: null, endDate: null, location: null, eventType: null, color: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockPrisma.event.create.mockResolvedValue(expected);

      const result = await service.create(dto as any);

      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const events = [{ id: '1', title: 'Event 1' }];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(events);
      expect(result.meta.total).toBe(1);
    });

    it('should filter deletedAt: null', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20 });

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an event if found', async () => {
      const event = { id: '1', title: 'Event 1' };
      mockPrisma.event.findFirst.mockResolvedValue(event);

      const result = await service.findOne('1');
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updated = { id: '1', title: 'Updated Event' };
      mockPrisma.event.update.mockResolvedValue(updated);

      const result = await service.update('1', { title: 'Updated Event' } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('remove (soft delete)', () => {
    it('should set deletedAt instead of hard delete', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: '1', deletedAt: null });
      mockPrisma.event.update.mockResolvedValue({ id: '1', deletedAt: new Date() });

      await service.remove('1');

      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('should throw NotFoundException if event not found on remove', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow();
    });
  });
});
