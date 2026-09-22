import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarCollapsed: boolean
}

const initialState: UIState = {
  sidebarCollapsed: localStorage.getItem('bwt-admin-ui-collapsed') === 'true',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('bwt-admin-ui-collapsed', String(state.sidebarCollapsed))
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
      localStorage.setItem('bwt-admin-ui-collapsed', String(state.sidebarCollapsed))
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed } = uiSlice.actions
export default uiSlice.reducer
