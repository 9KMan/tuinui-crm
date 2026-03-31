import { apiClient } from './client';

export const webhooksApi = {
  list: (activeOnly?: boolean) =>
    apiClient.get('/webhooks', { params: activeOnly !== undefined ? { activeOnly } : {} }),
  get: (id: string) => apiClient.get(`/webhooks/${id}`),
  create: (data: any) => apiClient.post('/webhooks', data),
  update: (id: string, data: any) => apiClient.patch(`/webhooks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/webhooks/${id}`),
  toggle: (id: string) => apiClient.post(`/webhooks/${id}/toggle`),
  deliver: (id: string, payload: any) => apiClient.post(`/webhooks/${id}/deliver`, payload),
};
