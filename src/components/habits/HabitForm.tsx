'use client'

import { useState } from 'react'
import { Habit } from '@/types/habit'
import { validateHabitName } from '@/lib/validators'

type Props = {
  onSave: (name: string, description: string) => void
  onCancel: () => void
  existing?: Habit
}

export default function HabitForm({ onSave, onCancel, existing }: Props) {
  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const validation = validateHabitName(name)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    setError(null)
    onSave(validation.value, description.trim())
  }

  return (
    <div
      data-testid="habit-form"
      className="p-6 mb-6 bg-white shadow-md rounded-2xl"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        {existing ? 'Edit Habit' : 'New Habit'}
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="habit-name"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Habit Name
          </label>
          <input
            id="habit-name"
            type="text"
            data-testid="habit-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Drink Water"
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && (
            <p className="mt-1 text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="habit-description"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <input
            id="habit-description"
            type="text"
            data-testid="habit-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 8 glasses a day"
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="habit-frequency"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            defaultValue="daily"
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            data-testid="habit-save-button"
            onClick={handleSave}
            className="flex-1 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            {existing ? 'Update Habit' : 'Save Habit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}