import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  name: string | null
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  status: string
  image?: string
  phone?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setUser, clearUser, setAuthError, setAuthLoading } = authSlice.actions
export default authSlice.reducer
