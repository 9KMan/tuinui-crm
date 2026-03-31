import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(
    query: string,
    options?: { targetTypes?: string[]; limit?: number },
  ): Promise<SearchResult[]> {
    const { targetTypes, limit = 10 } = options ?? {};

    const allTypes = ['contacts', 'companies', 'deals', 'tasks', 'notes'];
    const typesToSearch = targetTypes?.length ? targetTypes : allTypes;

    const results = await Promise.all([
      typesToSearch.includes('contacts') ? this.searchContacts(query, limit) : [],
      typesToSearch.includes('companies') ? this.searchCompanies(query, limit) : [],
      typesToSearch.includes('deals') ? this.searchDeals(query, limit) : [],
      typesToSearch.includes('tasks') ? this.searchTasks(query, limit) : [],
      typesToSearch.includes('notes') ? this.searchNotes(query, limit) : [],
    ]);

    return results.flat();
  }

  private async searchContacts(query: string, limit: number): Promise<SearchResult[]> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { company: { select: { name: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return contacts.map((c) => ({
      type: 'CONTACT',
      id: c.id,
      title: c.name,
      subtitle: c.email ?? c.company?.name,
    }));
  }

  private async searchCompanies(query: string, limit: number): Promise<SearchResult[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { domain: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return companies.map((c) => ({
      type: 'COMPANY',
      id: c.id,
      title: c.name,
      subtitle: c.domain ?? c.industry,
    }));
  }

  private async searchDeals(query: string, limit: number): Promise<SearchResult[]> {
    const deals = await this.prisma.deal.findMany({
      where: {
        deletedAt: null,
        OR: [{ title: { contains: query, mode: 'insensitive' } }],
      },
      include: {
        company: { select: { name: true } },
        contact: { select: { name: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return deals.map((d) => ({
      type: 'DEAL',
      id: d.id,
      title: d.title,
      subtitle: d.company?.name ?? d.contact?.name,
    }));
  }

  private async searchTasks(query: string, limit: number): Promise<SearchResult[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        deletedAt: null,
        OR: [{ title: { contains: query, mode: 'insensitive' } }],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => ({
      type: 'TASK',
      id: t.id,
      title: t.title,
      subtitle: t.description ?? undefined,
    }));
  }

  private async searchNotes(query: string, limit: number): Promise<SearchResult[]> {
    const notes = await this.prisma.note.findMany({
      where: {
        deletedAt: null,
        OR: [{ content: { contains: query, mode: 'insensitive' } }],
      },
      include: { author: { select: { name: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((n) => ({
      type: 'NOTE',
      id: n.id,
      title: n.content.length > 60 ? n.content.slice(0, 60) + '…' : n.content,
      subtitle: n.author.name,
    }));
  }
}
