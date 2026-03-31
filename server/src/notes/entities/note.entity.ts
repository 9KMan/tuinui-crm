import { LinkedEntityType } from '@prisma/client';

export interface NoteEntity {
  id: string;
  content: string;
  authorId: string;
  linkedType: LinkedEntityType;
  linkedId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
