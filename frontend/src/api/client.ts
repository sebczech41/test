import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Extract Laravel 422 field errors from an axios error. */
export function fieldErrors(err: unknown): Record<string, string[]> {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
    ?.data
  return data?.errors ?? {}
}

export function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data
  return data?.message || fallback
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
