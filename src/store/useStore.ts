import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: 'app-storage',
    }
  )
)

