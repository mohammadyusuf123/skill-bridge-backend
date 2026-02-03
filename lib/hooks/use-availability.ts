import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse, Availability } from '@/types/api'

export function useGetAvailability(tutorId: string) {
  return useQuery({
    queryKey: ['availability', tutorId],
    queryFn: async () => {
      const response = await apiClient.get<Availability[]>(
        `/api/availability/tutor/${tutorId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch availability')
      return response.data || []
    },
  })
}

export function useCreateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<Availability>(
        '/api/availability',
        data
      )
      if (!response.success) throw new Error(response.error || 'Failed to create availability')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}

export function useDeleteAvailability(availabilityId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<void>(
        `/api/availability/${availabilityId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to delete availability')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
