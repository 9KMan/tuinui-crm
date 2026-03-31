import { LinkedEntityType } from '@prisma/client';

export interface EventEntity {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  linkedType: LinkedEntityType;
  linkedId: string | null;
  attendees: unknown;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
