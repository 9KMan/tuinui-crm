// Core entity types for the CRM

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  roleId: string
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  companyId?: string
  jobTitle?: string
  avatar?: string
  customFields: Record<string, unknown>
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  domain?: string
  industry?: string
  size?: 'startup' | 'smb' | 'mid' | 'enterprise'
  address?: string
  logo?: string
  customFields: Record<string, unknown>
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  title: string
  amount: number
  currency: string
  stageId: string
  probability: number
  expectedCloseDate?: string
  companyId?: string
  contactId?: string
  customFields: Record<string, unknown>
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface PipelineStage {
  id: string
  name: string
  position: number
  color: string
  pipelineId: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  reminderAt?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  assigneeId?: string
  linkedType?: 'contact' | 'company' | 'deal'
  linkedId?: string
  recurring?: Record<string, unknown>
  completedAt?: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  description?: string
  startAt: string
  endAt?: string
  location?: string
  linkedType?: 'contact' | 'company' | 'deal'
  linkedId?: string
  attendees: Array<{ name: string; email: string }>
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  content: string
  authorId: string
  linkedType?: 'contact' | 'company' | 'deal'
  linkedId?: string
  createdAt: string
  updatedAt: string
}

export interface File {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  linkedType?: 'contact' | 'company' | 'deal'
  linkedId?: string
  uploadedById: string
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}
