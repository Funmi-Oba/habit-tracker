'use client'

import { useState } from 'react'
import { Habit } from '@/types/habit'
import { getHabitSlug } from '@/lib/slug'
import { calculateCurrentStreak } from '@/lib/streaks'
import { toggleHabitCompletion } from '@/lib/habits'

type Props = {
  habit: Habit
  onUpdate: (updated: Habit) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
}

export default function HabitCard({ habit, onUpdate, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const slug = getHabitSlug(habit.name)
  const today = new Date().toISOString().split('T')[0]
  const streak = calculateCurrentStreak(habit.completions, today)
  const isCompleted = habit.completions.includes(today)

  function handleToggle() {
    const updated = toggleHabitCompletion(habit, today)
    onUpdate(updated)
  }

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-2xl shadow-sm border p-4 mb-4 transition ${
        isCompleted
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800">{habit.name}</h3>
          {habit.description && (
            <p className="text-gray-500 text-sm mt-0.5">{habit.description}</p>
          )}
          <p
            data-testid={`habit-streak-${slug}`}
            className="mt-1 text-sm font-medium text-indigo-600"
          >
            🔥 {streak} day{streak !== 1 ? 's' : ''} streak
          </p>
        </div>

        <button
          type="button"
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          className={`text-xl px-3 py-1 rounded-lg border transition ${
            isCompleted
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-400 border-gray-300 hover:border-indigo-400'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted ? '✓' : '○'}
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          data-testid={`habit-edit-${slug}`}
          onClick={() => onEdit(habit)}
          className="px-3 py-1 text-xs text-gray-500 transition border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Edit
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            data-testid={`habit-delete-${slug}`}
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-1 text-xs text-red-500 transition border border-red-200 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Are you sure?</span>
            <button
              type="button"
              data-testid="confirm-delete-button"
              onClick={() => onDelete(habit.id)}
              className="px-3 py-1 text-xs text-white transition bg-red-500 rounded-lg hover:bg-red-600"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 text-xs text-gray-500 transition border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}