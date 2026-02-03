'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetTutorProfile } from '@/lib/hooks/use-tutors'
import { useGetTutorReviews } from '@/lib/hooks/use-reviews'
import { redirect, useParams } from 'next/navigation'
import { BookingForm } from '@/components/bookings/booking-form'

export default function TutorProfilePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const params = useParams()
  const tutorId = params.tutorId as string

  const { data: tutor, isLoading: isTutorLoading } = useGetTutorProfile(tutorId)
  const { data: reviews } = useGetTutorReviews(tutorId)

  if (isLoading || isTutorLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  if (!tutor) {
    return <div className="text-center py-12">Tutor not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tutor.title}</h1>
            <p className="text-lg text-muted mt-2">{tutor.user?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">${tutor.hourlyRate}</p>
            <p className="text-sm text-muted">per hour</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{tutor.rating || 'N/A'}</p>
            <p className="text-sm text-muted">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{tutor.reviewCount || 0}</p>
            <p className="text-sm text-muted">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{tutor.experience || 0}+</p>
            <p className="text-sm text-muted">Years</p>
          </div>
        </div>

        {tutor.headline && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Headline</h3>
            <p className="text-foreground">{tutor.headline}</p>
          </div>
        )}

        {tutor.description && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
            <p className="text-foreground whitespace-pre-wrap">{tutor.description}</p>
          </div>
        )}

        {tutor.education && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Education</h3>
            <p className="text-foreground">{tutor.education}</p>
          </div>
        )}

        {tutor.categories && tutor.categories.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-block px-3 py-1 bg-input text-foreground text-sm rounded"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {reviews && reviews.data && reviews.data.length > 0 && (
            <div className="card space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
              <div className="space-y-3">
                {reviews.data.map((review: any) => (
                  <div key={review.id} className="border-b border-border pb-3 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          ⭐ {review.rating} stars
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-foreground text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <BookingForm tutorId={tutorId} tutorRate={tutor.hourlyRate} />
        </div>
      </div>
    </div>
  )
}
