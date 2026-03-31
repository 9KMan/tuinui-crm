import { apiClient } from './client';

export const apiKeysApi = {
  list: () => apiClient.get('/api-keys'),
  get: (id: string) => apiClient.get(`/api-keys/${id}`),
  create: (data: any) => apiClient.post('/api-keys', data),
  delete: (id: string) => apiClient.delete(`/api-keys/${id}`),
};
