import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    setSession: vi.fn(),
    session: null,
    logout: vi.fn(),
    loading: false,
  }),
}))

import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(
      screen.getByTestId('auth-signup-email'),
      'test@example.com'
    )
    await user.type(
      screen.getByTestId('auth-signup-password'),
      'password123'
    )
    await user.click(screen.getByTestId('auth-signup-submit'))

    await waitFor(() => {
      const session = localStorage.getItem('habit-tracker-session')
      expect(session).not.toBeNull()
      const parsed = JSON.parse(session!)
      expect(parsed.email).toBe('test@example.com')
    })
  })

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup()

    // First signup
    render(<SignupForm />)
    await user.type(
      screen.getByTestId('auth-signup-email'),
      'duplicate@example.com'
    )
    await user.type(
      screen.getByTestId('auth-signup-password'),
      'password123'
    )
    await user.click(screen.getByTestId('auth-signup-submit'))

    await waitFor(() => {
      expect(localStorage.getItem('habit-tracker-session')).not.toBeNull()
    })

    // Clear DOM and try again with same email
    localStorage.removeItem('habit-tracker-session')
    const { unmount } = screen.queryAllByTestId('auth-signup-email').length
      ? { unmount: () => {} }
      : { unmount: () => {} }
    void unmount

    render(<SignupForm />)
    const emailInputs = screen.getAllByTestId('auth-signup-email')
    const passwordInputs = screen.getAllByTestId('auth-signup-password')
    const submitButtons = screen.getAllByTestId('auth-signup-submit')

    await user.type(emailInputs[emailInputs.length - 1], 'duplicate@example.com')
    await user.type(passwordInputs[passwordInputs.length - 1], 'password123')
    await user.click(submitButtons[submitButtons.length - 1])

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('User already exists')
    })
  })

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup()

    // Create a user first
    const users = [
      {
        id: 'user-1',
        email: 'login@example.com',
        password: 'password123',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('habit-tracker-users', JSON.stringify(users))

    render(<LoginForm />)

    await user.type(
      screen.getByTestId('auth-login-email'),
      'login@example.com'
    )
    await user.type(
      screen.getByTestId('auth-login-password'),
      'password123'
    )
    await user.click(screen.getByTestId('auth-login-submit'))

    await waitFor(() => {
      const session = localStorage.getItem('habit-tracker-session')
      expect(session).not.toBeNull()
      const parsed = JSON.parse(session!)
      expect(parsed.email).toBe('login@example.com')
    })
  })

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.type(
      screen.getByTestId('auth-login-email'),
      'wrong@example.com'
    )
    await user.type(
      screen.getByTestId('auth-login-password'),
      'wrongpassword'
    )
    await user.click(screen.getByTestId('auth-login-submit'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid email or password'
      )
    })
  })
})