import type { ApiResponse } from '@/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FetchOptions extends RequestInit {
  timeout?: number
}

class APIClient {
  private baseURL: string
  private timeout: number = 30000

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || `HTTP ${response.status}`)
      throw Object.assign(error, {
        status: response.status,
        data: errorData,
      })
    }

    return response.json()
  }

  async get<T>(
    endpoint: string,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })
    return this.handleResponse(response)
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return this.handleResponse(response)
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return this.handleResponse(response)
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return this.handleResponse(response)
  }

  async delete<T>(
    endpoint: string,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })
    return this.handleResponse(response)
  }
}

export const apiClient = new APIClient()
