import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse, Review } from '@/types/api'

export function useGetTutorReviews(tutorId: string) {
  return useQuery({
    queryKey: ['reviews', tutorId],
    queryFn: async () => {
      const response = await apiClient.get<any>(
        `/api/reviews/tutor/${tutorId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch reviews')
      return response.data
    },
  })
}

export function useGetReview(reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const response = await apiClient.get<Review>(
        `/api/reviews/${reviewId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch review')
      return response.data
    },
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<Review>(
        '/api/reviews',
        data
      )
      if (!response.success) throw new Error(response.error || 'Failed to create review')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
