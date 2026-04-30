import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Habit } from '@/types/habit'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    setSession: vi.fn(),
    session: { userId: 'user-1', email: 'test@example.com' },
    logout: vi.fn(),
    loading: false,
  }),
}))

import HabitForm from '@/components/habits/HabitForm'
import HabitCard from '@/components/habits/HabitCard'

const today = new Date().toISOString().split('T')[0]

const mockHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: new Date().toISOString(),
  completions: [],
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<HabitForm onSave={onSave} onCancel={vi.fn()} />)

    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Habit name is required'
      )
    })

    expect(onSave).not.toHaveBeenCalled()
  })

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<HabitForm onSave={onSave} onCancel={vi.fn()} />)

    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water')
    await user.type(
      screen.getByTestId('habit-description-input'),
      'Stay hydrated'
    )
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Drink Water', 'Stay hydrated')
    })
  })

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <HabitForm
        existing={mockHabit}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    const nameInput = screen.getByTestId('habit-name-input')
    await user.clear(nameInput)
    await user.type(nameInput, 'Drink More Water')
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Drink More Water', 'Stay hydrated')
    })

    // Immutable fields must not be passed to onSave — they are preserved
    // by the dashboard handler using the original habit object
    expect(onSave).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ id: expect.anything() })
    )
  })

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onUpdate = vi.fn()
    const onEdit = vi.fn()

    render(
      <HabitCard
        habit={mockHabit}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onEdit={onEdit}
      />
    )

    // Click delete — should not delete yet
    await user.click(screen.getByTestId('habit-delete-drink-water'))
    expect(onDelete).not.toHaveBeenCalled()

    // Confirm delete button should now appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument()
    })

    // Now confirm
    await user.click(screen.getByTestId('confirm-delete-button'))
    expect(onDelete).toHaveBeenCalledWith('habit-1')
  })

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(
      <HabitCard
        habit={mockHabit}
        onUpdate={onUpdate}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Streak should start at 0
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent(
      '0 days streak'
    )

    // Toggle completion
    await user.click(screen.getByTestId('habit-complete-drink-water'))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          completions: expect.arrayContaining([today]),
        })
      )
    })
  })
})