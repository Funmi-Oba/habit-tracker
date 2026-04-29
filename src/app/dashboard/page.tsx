'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Habit } from '@/types/habit'
import { getSession, getHabits, saveHabits } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'
import HabitCard from '@/components/habits/HabitCard'
import HabitForm from '@/components/habits/HabitForm'

export default function DashboardPage() {
  const router = useRouter()
  const { session, logout, loading } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    if (loading) return
    const currentSession = getSession()
    if (!currentSession) {
      router.push('/login')
      return
    }
    const allHabits = getHabits()
    const userHabits = allHabits.filter(
      (h) => h.userId === currentSession.userId
    )
    setHabits(userHabits)
  }, [loading, router])

  function handleCreate(name: string, description: string) {
    const currentSession = getSession()
    if (!currentSession) return

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId: currentSession.userId,
      name,
      description,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      completions: [],
    }

    const allHabits = getHabits()
    const updated = [...allHabits, newHabit]
    saveHabits(updated)
    setHabits((prev) => [...prev, newHabit])
    setShowForm(false)
  }

  function handleEdit(name: string, description: string) {
    if (!editingHabit) return

    const updatedHabit: Habit = {
      ...editingHabit,
      name,
      description,
    }

    const allHabits = getHabits()
    const updated = allHabits.map((h) =>
      h.id === updatedHabit.id ? updatedHabit : h
    )
    saveHabits(updated)
    setHabits((prev) =>
      prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    )
    setEditingHabit(null)
  }

  function handleUpdate(updated: Habit) {
    const allHabits = getHabits()
    const newAll = allHabits.map((h) => (h.id === updated.id ? updated : h))
    saveHabits(newAll)
    setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)))
  }

  function handleDelete(id: string) {
    const allHabits = getHabits()
    const updated = allHabits.filter((h) => h.id !== id)
    saveHabits(updated)
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  function handleLogout() {
    logout()
    router.push('/login')
  }

  if (loading) return null

  return (
    <div
      data-testid="dashboard-page"
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-indigo-600">Habit Tracker</h1>
        <button
          type="button"
          data-testid="auth-logout-button"
          onClick={handleLogout}
          className="px-3 py-1 text-sm text-gray-500 transition border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Log out
        </button>
      </header>

      <main className="max-w-lg px-4 py-6 mx-auto">
        {/* Create button */}
        {!showForm && !editingHabit && (
          <button
            type="button"
            data-testid="create-habit-button"
            onClick={() => setShowForm(true)}
            className="w-full py-3 mb-6 text-sm font-medium text-white transition bg-indigo-600 rounded-2xl hover:bg-indigo-700"
          >
            + New Habit
          </button>
        )}

        {/* Create form */}
        {showForm && (
          <HabitForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Edit form */}
        {editingHabit && (
          <HabitForm
            existing={editingHabit}
            onSave={handleEdit}
            onCancel={() => setEditingHabit(null)}
          />
        )}

        {/* Empty state */}
        {habits.length === 0 && !showForm && (
          <div
            data-testid="empty-state"
            className="py-16 text-center text-gray-400"
          >
            <p className="mb-3 text-4xl">📋</p>
            <p className="text-sm">No habits yet. Create your first one!</p>
          </div>
        )}

        {/* Habit list */}
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onUpdate={handleUpdate}
            onEdit={(h) => {
              setEditingHabit(h)
              setShowForm(false)
            }}
            onDelete={handleDelete}
          />
        ))}
      </main>
    </div>
  )
}