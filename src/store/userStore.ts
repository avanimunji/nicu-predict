import { create } from 'zustand'

export interface PanelPrefs {
  /** Panel IDs that should auto-expand on login (click count >= threshold) */
  autoExpand:  string[]
  /** Raw click counts per panel — used to decide auto-expand */
  clickCounts: Record<string, number>
}

interface UserState {
  userId:     string | null
  email:      string | null
  panelPrefs: PanelPrefs
  /** ID of the patient currently shown on the dashboard */
  selectedPatientId: string | null

  setUser:           (id: string, email: string) => void
  clearUser:         () => void
  setPanelPrefs:     (prefs: PanelPrefs) => void
  setSelectedPatient:(id: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  userId:            null,
  email:             null,
  panelPrefs:        { autoExpand: [], clickCounts: {} },
  selectedPatientId: null,

  setUser:  (id, email) => set({ userId: id, email }),
  clearUser: ()         => set({ userId: null, email: null, panelPrefs: { autoExpand: [], clickCounts: {} } }),

  setPanelPrefs: (prefs) => set({ panelPrefs: prefs }),

  setSelectedPatient: (id) => set({ selectedPatientId: id }),
}))