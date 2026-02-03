import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse, AuthUser } from '@/types/api'

export function useGetProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get<AuthUser>('/api/users/profile')
      if (!response.success) throw new Error(response.error || 'Failed to fetch profile')
      return response.data
    },
  })
}

export function useGetUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get<AuthUser>(`/api/users/${userId}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch user')
      return response.data
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<AuthUser>) => {
      const response = await apiClient.put<AuthUser>('/api/users/profile', data)
      if (!response.success) throw new Error(response.error || 'Failed to update profile')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data)
    },
  })
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/api/users/${userId}`)
      if (!response.success) throw new Error(response.error || 'Failed to delete user')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
