'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetAllTutors, useSearchTutors } from '@/lib/hooks/use-tutors'
import { useGetCategories } from '@/lib/hooks/use-categories'
import { useState } from 'react'
import { TutorCard } from '@/components/tutors/tutor-card'
import { redirect } from 'next/navigation'

export default function TutorsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minRate, setMinRate] = useState(0)
  const [maxRate, setMaxRate] = useState(500)

  const { data: categories } = useGetCategories()
  const { data: tutorsData, isLoading: isTutorsLoading } = useGetAllTutors()

  const filteredTutors = tutorsData?.data?.filter((tutor: any) => {
    const matchesSearch =
      !search ||
      tutor.title.toLowerCase().includes(search.toLowerCase()) ||
      tutor.user?.name?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      !selectedCategory ||
      tutor.categories?.some((c: any) => c.id === selectedCategory)

    const matchesPrice =
      tutor.hourlyRate >= minRate && tutor.hourlyRate <= maxRate

    return matchesSearch && matchesCategory && matchesPrice
  }) || []

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Find Tutors</h1>
        <p className="text-muted mt-2">Discover and book qualified tutors</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Min Rate: ${minRate}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              value={minRate}
              onChange={(e) => setMinRate(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Rate: ${maxRate}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {isTutorsLoading ? (
        <div className="text-center py-12">Loading tutors...</div>
      ) : filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTutors.map((tutor: any) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-muted">No tutors found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
