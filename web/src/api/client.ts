import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
}

// Generic CRUD API helpers
export const createApi = <T>(resource: string) => ({
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<T[]>(`/${resource}`, { params }),
  getOne: (id: string) => apiClient.get<T>(`/${resource}/${id}`),
  create: (data: Partial<T>) => apiClient.post<T>(`/${resource}`, data),
  update: (id: string, data: Partial<T>) =>
    apiClient.put<T>(`/${resource}/${id}`, data),
  delete: (id: string) => apiClient.delete(`/${resource}/${id}`),
})

export default apiClient
