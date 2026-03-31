import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../prisma/prisma.service';
// NoteTargetType: string literal union ('CONTACT' | 'COMPANY' | 'DEAL' | 'TASK')

describe('NotesService', () => {
  let service: NotesService;
  let prisma: PrismaService;

  const mockPrisma = {
    note: {
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
        NotesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a note with mapped targetType', async () => {
      const dto = { content: 'Test note', targetType: 'CONTACT', targetId: 'contact-1' };
      const expected = { id: 'uuid-1', content: 'Test note', linkedType: 'CONTACT', linkedId: 'contact-1', authorId: 'user-1', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockPrisma.note.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.note.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          authorId: 'user-1',
          linkedType: 'CONTACT',
          linkedId: dto.targetId,
        },
        include: { author: { select: { id: true, name: true } } },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated notes', async () => {
      const notes = [{ id: '1', content: 'Note 1' }];
      mockPrisma.note.findMany.mockResolvedValue(notes);
      mockPrisma.note.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data).toEqual(notes);
      expect(result.total).toBe(1);
    });

    it('should filter deletedAt: null', async () => {
      mockPrisma.note.findMany.mockResolvedValue([]);
      mockPrisma.note.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should filter by targetType and targetId', async () => {
      mockPrisma.note.findMany.mockResolvedValue([]);
      mockPrisma.note.count.mockResolvedValue(0);

      await service.findAll({ targetType: 'CONTACT', targetId: 'contact-1' });

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            linkedType: 'CONTACT',
            linkedId: 'contact-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a note if found', async () => {
      const note = { id: '1', content: 'Note 1' };
      mockPrisma.note.findUnique.mockResolvedValue(note);

      const result = await service.findOne('1');
      expect(result).toEqual(note);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow('Note not found');
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const existing = { id: '1', content: 'Old content' };
      const updated = { id: '1', content: 'Updated content' };
      mockPrisma.note.findUnique.mockResolvedValue(existing);
      mockPrisma.note.update.mockResolvedValue(updated);

      const result = await service.update('1', { content: 'Updated content' } as any);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if note not found on update', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-id', { content: 'test' } as any)).rejects.toThrow();
    });
  });

  describe('remove (soft delete)', () => {
    it('should set deletedAt instead of hard delete', async () => {
      const note = { id: '1', content: 'Note 1' };
      mockPrisma.note.findUnique.mockResolvedValue(note);
      mockPrisma.note.update.mockResolvedValue({ id: '1', deletedAt: new Date() });

      await service.remove('1');

      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('should throw NotFoundException if note not found on remove', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow('Note not found');
    });
  });
});
