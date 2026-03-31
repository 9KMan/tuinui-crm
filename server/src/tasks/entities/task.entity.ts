import { TaskPriority, TaskStatus, LinkedEntityType } from '@prisma/client';

export interface TaskEntity {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  reminderAt: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  linkedType: LinkedEntityType;
  linkedId: string | null;
  recurring: Record<string, unknown> | null;
  completedAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
  };
}
