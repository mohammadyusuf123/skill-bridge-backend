import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse, Booking } from '@/types/api'

export function useGetMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<any>(
        '/api/bookings/my-bookings'
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch bookings')
      return response.data
    },
  })
}

export function useGetBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await apiClient.get<Booking>(
        `/api/bookings/${bookingId}`
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch booking')
      return response.data
    },
  })
}

export function useGetBookingStats() {
  return useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<any>(
        '/api/bookings/stats'
      )
      if (!response.success) throw new Error(response.error || 'Failed to fetch stats')
      return response.data
    },
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<Booking>(
        '/api/bookings',
        data
      )
      if (!response.success) throw new Error(response.error || 'Failed to create booking')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] })
    },
  })
}

export function useUpdateBooking(bookingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put<Booking>(
        `/api/bookings/${bookingId}`,
        data
      )
      if (!response.success) throw new Error(response.error || 'Failed to update booking')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['booking', bookingId], data)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reason?: string) => {
      const response = await apiClient.post<Booking>(
        `/api/bookings/${bookingId}/cancel`,
        { reason }
      )
      if (!response.success) throw new Error(response.error || 'Failed to cancel booking')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['booking', bookingId], data)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useCompleteBooking(bookingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<Booking>(
        `/api/bookings/${bookingId}/complete`,
        {}
      )
      if (!response.success) throw new Error(response.error || 'Failed to complete booking')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['booking', bookingId], data)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
