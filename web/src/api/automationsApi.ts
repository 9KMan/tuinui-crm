import { apiClient } from './client';

export const automationsApi = {
  list: (activeOnly?: boolean) =>
    apiClient.get('/automations', { params: activeOnly !== undefined ? { activeOnly } : {} }),
  get: (id: string) => apiClient.get(`/automations/${id}`),
  create: (data: any) => apiClient.post('/automations', data),
  update: (id: string, data: any) => apiClient.patch(`/automations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/automations/${id}`),
  toggle: (id: string) => apiClient.post(`/automations/${id}/toggle`),
  test: (id: string, data?: any) => apiClient.post(`/automations/${id}/test`, data),
  logs: (id: string, limit?: number) => apiClient.get(`/automations/${id}/logs`, { params: { limit } }),
};
