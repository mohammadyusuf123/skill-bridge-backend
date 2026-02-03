import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse, TutorProfile } from '@/types/api'

interface SearchTutorsParams {
  categoryId?: string
  search?: string
  minRate?: number
  maxRate?: number
  minRating?: number
}

export function useGetAllTutors(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['tutors', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<any>(
        `/api/tutors?page=${page}&limit=${limit}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch tutors')
      return response.data
    },
  })
}

export function useSearchTutors(params: SearchTutorsParams) {
  return useQuery({
    queryKey: ['tutors', 'search', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString()

      const response = await apiClient.get<any>(
        `/api/tutors/search?${queryString}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to search tutors')
      return response.data
    },
  })
}

export function useGetTutorProfile(tutorId: string) {
  return useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: async () => {
      const response = await apiClient.get<TutorProfile>(
        `/api/tutors/${tutorId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch tutor profile')
      return response.data
    },
  })
}

export function useGetOwnTutorProfile() {
  return useQuery({
    queryKey: ['tutor', 'own'],
    queryFn: async () => {
      const response = await apiClient.get<TutorProfile>(
        '/api/tutors/profile/me'
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch your profile')
      return response.data
    },
  })
}

export function useCreateTutorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<TutorProfile>(
        '/api/tutors/profile',
        data
      )
      if (!response.success) throw new Error(response.error || 'Failed to create profile')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tutor', 'own'], data)
      queryClient.invalidateQueries({ queryKey: ['tutors'] })
    },
  })
}

export function useUpdateTutorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put<TutorProfile>(
        '/api/tutors/profile',
        data
      )
      if (!response.success) throw new Error(response.error || 'Failed to update profile')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tutor', 'own'], data)
      queryClient.invalidateQueries({ queryKey: ['tutors'] })
    },
  })
}

export function useToggleAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<TutorProfile>(
        '/api/tutors/availability/toggle',
        {}
      )
      if (!response.success) throw new Error(response.error || 'Failed to toggle availability')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tutor', 'own'], data)
    },
  })
}
