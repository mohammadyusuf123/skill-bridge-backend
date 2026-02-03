import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: number
  }[]
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'system',
  notifications: [],
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>
    ) => {
      state.notifications.push({
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
} = uiSlice.actions
export default uiSlice.reducer
