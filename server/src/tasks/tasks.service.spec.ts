import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  const mockPrisma = {
    task: {
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
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { title: 'Test Task', status: 'pending' as const };
      const expected = { id: 'uuid-1', ...dto, dueDate: null, recurring: null, assigneeId: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockPrisma.task.create.mockResolvedValue(expected);

      const result = await service.create(dto as any);

      expect(result).toEqual(expected);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with meta', async () => {
      const tasks = [{ id: '1', title: 'Task 1' }];
      mockPrisma.task.findMany.mockResolvedValue(tasks);
      mockPrisma.task.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(tasks);
      expect(result.meta.total).toBe(1);
    });

    it('should filter deletedAt: null', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20 });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a task if found', async () => {
      const task = { id: '1', title: 'Task 1' };
      mockPrisma.task.findFirst.mockResolvedValue(task);

      const result = await service.findOne('1');
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updated = { id: '1', title: 'Updated Task', status: 'in-progress' };
      mockPrisma.task.update.mockResolvedValue(updated);

      const result = await service.update('1', { status: 'in-progress' as const } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('remove (soft delete)', () => {
    it('should set deletedAt instead of hard delete', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: '1', deletedAt: null });
      mockPrisma.task.update.mockResolvedValue({ id: '1', deletedAt: new Date() });

      await service.remove('1');

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('should throw NotFoundException if task not found on remove', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow();
    });
  });
});
