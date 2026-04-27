import { create } from 'zustand'
import type { Patient } from '../data/patients.ts'
import { PATIENTS } from '../data/patients.ts'

interface PatientState {
  patients:        Patient[]
  selectedId:      string
  selectedPatient: Patient

  selectPatient: (id: string) => void
}

export const usePatientStore = create<PatientState>((set) => ({
  patients:        PATIENTS,
  selectedId:      PATIENTS[0].id,
  selectedPatient: PATIENTS[0],

  selectPatient: (id) => {
    const found = PATIENTS.find(p => p.id === id)
    if (found) set({ selectedId: id, selectedPatient: found })
  },
}))