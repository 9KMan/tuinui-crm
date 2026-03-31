import { Test, TestingModule } from '@nestjs/testing';
import { SearchService, SearchResult } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;

  const mockPrisma = {
    contact: { findMany: jest.fn() },
    company: { findMany: jest.fn() },
    deal: { findMany: jest.fn() },
    task: { findMany: jest.fn() },
    note: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should search across all entity types', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([
        { id: 'c1', name: 'John Doe', email: 'john@test.com', company: { name: 'Acme' } },
      ]);
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.note.findMany.mockResolvedValue([]);

      const results = await service.search('john');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toMatchObject({
        type: expect.stringMatching(/contacts|companies|deals|tasks|notes/),
        id: expect.any(String),
        title: expect.any(String),
      });
    });

    it('should return SearchResult shape', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([
        { id: 'c1', name: 'Jane Doe', email: 'jane@test.com', company: null },
      ]);
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.note.findMany.mockResolvedValue([]);

      const results = await service.search('jane');

      expect(results[0]).toHaveProperty('type');
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('title');
    });

    it('should filter by targetTypes', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([
        { id: 'c1', name: 'John', email: 'john@test.com', company: null },
      ]);
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.note.findMany.mockResolvedValue([]);

      await service.search('john', { targetTypes: ['contacts'] });

      expect(mockPrisma.contact.findMany).toHaveBeenCalled();
      // companies/deals/tasks/notes should NOT be called
      expect(mockPrisma.company.findMany).not.toHaveBeenCalled();
    });

    it('should respect limit option', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([{ id: 'c1', name: 'John', email: 'john@test.com', company: null }]);
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.note.findMany.mockResolvedValue([]);

      await service.search('john', { limit: 5 });

      // Each entity should be called with take: 5
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it('should return empty array when no results', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.deal.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.note.findMany.mockResolvedValue([]);

      const results = await service.search('nonexistent');

      expect(results).toEqual([]);
    });
  });
});
