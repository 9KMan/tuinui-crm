import { atom } from 'jotai'
import type { User } from '../types'

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    return {
      user,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
    }
  } catch {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }
  }
}

export const authStateAtom = atom<AuthState>(loadInitialState())

// Derived atoms
export const userAtom = atom((get) => get(authStateAtom).user)
export const isAuthenticatedAtom = atom((get) => get(authStateAtom).isAuthenticated)

// Actions
export const loginAtom = atom(
  null,
  (_get, set, payload: { user: User; accessToken: string; refreshToken: string }) => {
    localStorage.setItem('access_token', payload.accessToken)
    localStorage.setItem('refresh_token', payload.refreshToken)
    localStorage.setItem('user', JSON.stringify(payload.user))
    set(authStateAtom, {
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      isAuthenticated: true,
    })
  }
)

export const logoutAtom = atom(null, (_get, set) => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  set(authStateAtom, {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  })
})

export const updateUserAtom = atom(null, (_get, set, user: User) => {
  localStorage.setItem('user', JSON.stringify(user))
  set(authStateAtom, (state) => ({ ...state, user }))
})
