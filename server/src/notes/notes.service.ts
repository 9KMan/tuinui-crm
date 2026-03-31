import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, NoteTargetType } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { LinkedEntityType } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  private mapTargetTypeToLinkedEntityType(targetType: NoteTargetType): LinkedEntityType {
    switch (targetType) {
      case NoteTargetType.CONTACT:
        return LinkedEntityType.CONTACT;
      case NoteTargetType.COMPANY:
        return LinkedEntityType.COMPANY;
      case NoteTargetType.DEAL:
        return LinkedEntityType.DEAL;
      case NoteTargetType.TASK:
        return LinkedEntityType.TASK;
    }
  }

  async findAll(params: { targetType?: NoteTargetType; targetId?: string }) {
    const { targetType, targetId } = params;

    const where: Record<string, unknown> = { deletedAt: null };

    if (targetType) {
      where.linkedType = this.mapTargetTypeToLinkedEntityType(targetType);
    }
    if (targetId) {
      where.linkedId = targetId;
    }

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.note.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async create(dto: CreateNoteDto, userId: string) {
    return this.prisma.note.create({
      data: {
        content: dto.content,
        authorId: userId,
        linkedType: this.mapTargetTypeToLinkedEntityType(dto.targetType),
        linkedId: dto.targetId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, dto: UpdateNoteDto) {
    const existing = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Note not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.content !== undefined) data.content = dto.content;

    return this.prisma.note.update({ where: { id }, data });
  }

  async remove(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id, deletedAt: null },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Note deleted successfully' };
  }
}
