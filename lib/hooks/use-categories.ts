import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse, Category } from '@/types/api'

export function useGetCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>(
        '/api/tutor-categories'
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch categories')
      return response.data || []
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useGetCategory(categoryId: string) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const response = await apiClient.get<Category>(
        `/api/tutor-categories/${categoryId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch category')
      return response.data
    },
  })
}
