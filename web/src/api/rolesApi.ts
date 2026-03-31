import { apiClient } from './client';

export const rolesApi = {
  list: () => apiClient.get('/roles'),
  get: (id: string) => apiClient.get(`/roles/${id}`),
  create: (data: any) => apiClient.post('/roles', data),
  update: (id: string, data: any) => apiClient.patch(`/roles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/roles/${id}`),
  seed: () => apiClient.post('/roles/seed'),
};
