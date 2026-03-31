import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let prisma: PrismaService;

  const mockPrisma = {
    activity: {
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
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create an activity with all fields', async () => {
      const params = {
        type: 'CONTACT_CREATED',
        userId: 'user-1',
        linkedType: 'CONTACT',
        linkedId: 'contact-1',
        subject: 'New Contact',
        body: 'Created a new contact',
      };
      const expected = { id: 'uuid-1', ...params, metadata: {}, createdAt: new Date() };
      mockPrisma.activity.create.mockResolvedValue(expected);

      const result = await service.log(params);

      expect(result).toEqual(expected);
      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: params.type,
          userId: params.userId,
          linkedType: params.linkedType,
          linkedId: params.linkedId,
        }),
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      const activities = [{ id: '1', type: 'CONTACT_CREATED' }];
      mockPrisma.activity.findMany.mockResolvedValue(activities);
      mockPrisma.activity.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(activities);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by linkedType and linkedId', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([]);
      mockPrisma.activity.count.mockResolvedValue(0);

      await service.findAll({ linkedType: 'CONTACT', linkedId: 'contact-1' });

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            linkedType: 'CONTACT',
            linkedId: 'contact-1',
          }),
        }),
      );
    });
  });
});
