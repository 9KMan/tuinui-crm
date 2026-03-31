import { apiClient } from './client';

export const customFieldsApi = {
  list: (entityType?: string) =>
    apiClient.get('/custom-fields', { params: { entityType } }),
  get: (id: string) =>
    apiClient.get(`/custom-fields/${id}`),
  create: (data: any) =>
    apiClient.post('/custom-fields', data),
  update: (id: string, data: any) =>
    apiClient.patch(`/custom-fields/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/custom-fields/${id}`),
  setValues: (entityType: string, entityId: string, values: Record<string, any>) =>
    apiClient.post(`/custom-fields/values/${entityType}/${entityId}`, values),
  getValues: (entityType: string, entityId: string) =>
    apiClient.get(`/custom-fields/values/${entityType}/${entityId}`),
};
