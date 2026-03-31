import { apiClient } from './client';

export const auditApi = {
  list: (params?: { userId?: string; entityType?: string; action?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiClient.get('/audit-logs', { params }),
};
