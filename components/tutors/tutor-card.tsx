'use client'

import Link from 'next/link'
import type { TutorProfile } from '@/types/api'

export function TutorCard({ tutor }: { tutor: TutorProfile }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{tutor.title}</h3>
          <p className="text-sm text-muted mt-1">{tutor.user?.name || 'Tutor'}</p>
        </div>
        {tutor.isAvailable && (
          <span className="inline-block px-2 py-1 bg-success text-white text-xs rounded font-medium">
            Available
          </span>
        )}
      </div>

      <p className="text-sm text-foreground line-clamp-2">
        {tutor.description || 'No description available'}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">${tutor.hourlyRate}/hr</p>
          {tutor.rating && (
            <p className="text-sm text-muted">
              ⭐ {tutor.rating} ({tutor.reviewCount || 0} reviews)
            </p>
          )}
        </div>
      </div>

      {tutor.categories && tutor.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tutor.categories.slice(0, 3).map((category) => (
            <span
              key={category.id}
              className="inline-block px-2 py-1 bg-input text-foreground text-xs rounded"
            >
              {category.name}
            </span>
          ))}
          {tutor.categories.length > 3 && (
            <span className="inline-block px-2 py-1 bg-input text-muted text-xs rounded">
              +{tutor.categories.length - 3} more
            </span>
          )}
        </div>
      )}

      <Link href={`/dashboard/tutors/${tutor.id}`} className="btn-primary w-full">
        View Profile
      </Link>
    </div>
  )
}
