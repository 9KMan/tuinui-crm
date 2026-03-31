import { DealStage } from '@prisma/client';

export interface DealCompany {
  id: string;
  name: string;
}

export interface DealContact {
  id: string;
  name: string;
  email: string | null;
}

export interface DealCreator {
  id: string;
  name: string;
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate: Date | null;
  companyId: string | null;
  contactId: string | null;
  customFields: Record<string, unknown>;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  company?: DealCompany | null;
  contact?: DealContact | null;
  createdBy?: DealCreator | null;
}
