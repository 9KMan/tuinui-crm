import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
// LinkedEntityType: string literals ('CONTACT' | 'COMPANY' | 'DEAL' | 'TASK')

describe('FilesService', () => {
  let service: FilesService;
  let prisma: PrismaService;

  const mockPrisma = {
    file: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a file record', async () => {
      const dto = { name: 'document.pdf', mimeType: 'application/pdf', size: 1024, targetType: 'CONTACT', targetId: 'contact-1' };
      const expected = { id: 'uuid-1', ...dto, url: null, localPath: null, uploadedById: 'user-1', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockPrisma.file.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.file.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          mimeType: dto.mimeType,
          size: dto.size,
          uploadedById: 'user-1',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated files', async () => {
      const files = [{ id: '1', name: 'doc.pdf' }];
      mockPrisma.file.findMany.mockResolvedValue(files);
      mockPrisma.file.count.mockResolvedValue(1);

      const result = await service.findAll({ take: 50, skip: 0 });

      expect(result.data).toEqual(files);
      expect(result.total).toBe(1);
    });

    it('should filter deletedAt: null', async () => {
      mockPrisma.file.findMany.mockResolvedValue([]);
      mockPrisma.file.count.mockResolvedValue(0);

      await service.findAll({ take: 50, skip: 0 });

      expect(mockPrisma.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should filter by targetType and targetId', async () => {
      mockPrisma.file.findMany.mockResolvedValue([]);
      mockPrisma.file.count.mockResolvedValue(0);

      await service.findAll({ targetType: 'CONTACT', targetId: 'contact-1' });

      expect(mockPrisma.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            linkedType: LinkedEntityType.CONTACT,
            linkedId: 'contact-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a file if found', async () => {
      const file = { id: '1', name: 'doc.pdf' };
      mockPrisma.file.findUnique.mockResolvedValue(file);

      const result = await service.findOne('1');
      expect(result).toEqual(file);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.file.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow();
    });
  });

  describe('remove (soft delete)', () => {
    it('should set deletedAt instead of hard delete', async () => {
      const file = { id: '1', name: 'doc.pdf' };
      mockPrisma.file.findUnique.mockResolvedValue(file);
      mockPrisma.file.update.mockResolvedValue({ id: '1', deletedAt: new Date() });

      await service.remove('1');

      expect(mockPrisma.file.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });
  });
});
