/**
 * DashboardPage.tsx
 *
 * Layout:
 *   ┌─────────────┬─────────────────────────────────────────┐
 *   │             │  PatientHeader                          │
 *   │  Sidebar    ├──────────┬──────────┬───────────────────┤
 *   │  (patient   │  Risk    │  Vitals  │  SHAP             │
 *   │   switcher) │  Score   │          │  features         │
 *   │             ├──────────┴──────────┼───────────────────┤
 *   │             │  Age at surgery     │  Complications    │
 *   │             ├─────────────────────┴───────────────────┤
 *   │             │  Cohort Benchmarking (full width)       │
 *   └─────────────┴─────────────────────────────────────────┘
 *
 * All panels use BasePanel → tracking + preference engine auto-expand built in.
 */

import { useEffect } from 'react'
import { Sidebar }               from '../components/layout/Sidebar'
import { PatientHeader }         from '../components/layout/PatientHeader'
import { RiskScorePanel }        from '../components/panels/RiskScorePanel'
import { VitalsPanel }           from '../components/panels/VitalsPanel'
import { ShapPanel }             from '../components/panels/ShapPanel'
import { AgeAtSurgeryPanel }     from '../components/panels/AgeAtSurgeryPanel'
import { ComplicationsPanel }    from '../components/panels/ComplicationsPanel'
import { CohortBenchmarkPanel }  from '../components/panels/CohortBenchmarkPanel'
import { usePatientStore }       from '../store/patientStore'
import { useUserStore }          from '../store/userStore'
import { useUserPrefs }          from '../hooks/useUserPrefs'
import { useTracking }           from '../hooks/useTracking'
import { initAnalytics, teardownAnalytics } from '../lib/analytics'

export function DashboardPage() {
  const patient        = usePatientStore(s => s.selectedPatient)
  const userId         = useUserStore(s => s.userId)
  const panelPrefs     = useUserStore(s => s.panelPrefs)
  const { track }      = useTracking()

  // Load user panel preferences from Supabase on mount
  useUserPrefs()

  // Start mouse-movement analytics session
  useEffect(() => {
    if (userId) initAnalytics(userId)
    return () => teardownAnalytics()
  }, [userId])

  // Track patient switches
  const handlePatientSwitch = (id: string) => {
    track({ event_type: 'patient_switch', panel_id: 'sidebar', patient_id: id })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5efe6]">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar onPatientSelect={handlePatientSwitch} />

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Patient header bar */}
        <PatientHeader patient={patient} />

        {/* Scrollable panel grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-4 max-w-[1400px]">

            {/* Row 1 */}
            <RiskScorePanel
              patient={patient}
            />
            <VitalsPanel
              patient={patient}
            />
            <ShapPanel
              patient={patient}
            />

            {/* Row 2 */}
            <div className="col-span-2">
              <AgeAtSurgeryPanel
                patient={{
                  id:                 patient.id,
                  ageAtSurgeryDays:   patient.ageAtSurgeryDays,
                  ageAtSurgeryMonths: patient.ageAtSurgeryMonths,
                  diagnosis:          patient.diagnosis,
                  hadOcclusion:       null,
                }}
                panelId="age_at_surgery"
                defaultExpanded={panelPrefs.autoExpand.includes('age_at_surgery')}
                onTrack={e => track({ event_type: e.event_type as any, panel_id: e.panel_id })}
              />
            </div>
            <ComplicationsPanel patient={patient} />

            {/* Row 3 — full width */}
            <div className="col-span-3">
              <CohortBenchmarkPanel patient={patient} />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}