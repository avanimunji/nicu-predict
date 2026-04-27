/**
 * ComplicationsPanel.tsx
 * Cream UI refactor — preserves clinical binary encoding + procedure signal
 */

import { BasePanel } from '../ui/BasePanel'
import type { Patient } from '../../data/patients'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// ─── Row type ───────────────────────────────────────────────────────────────

interface CompRow {
  label: string
  value: boolean | null
}

// ─── Pill row ───────────────────────────────────────────────────────────────

function CompPill({ label, value }: CompRow) {
  const baseStyle = {
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as const

  if (value === null) {
    return (
      <div style={baseStyle}>
        <AlertCircle size={12} color="rgba(0,0,0,0.25)" />
        <span style={{ color: 'rgba(0,0,0,0.4)' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(0,0,0,0.25)' }}>
          N/A
        </span>
      </div>
    )
  }

  const isYes = value

  return (
    <div style={baseStyle}>
      {isYes ? (
        <XCircle size={12} color="#ef4444" />
      ) : (
        <CheckCircle size={12} color="#22c55e" />
      )}

      <span
        style={{
          color: isYes ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)',
        }}
      >
        {label}
      </span>

      <span
        style={{
          marginLeft: 'auto',
          fontSize: 8,
          padding: '2px 6px',
          borderRadius: 999,
          border: isYes
            ? '1px solid rgba(239,68,68,0.25)'
            : '1px solid rgba(34,197,94,0.2)',
          background: isYes
            ? 'rgba(239,68,68,0.08)'
            : 'rgba(34,197,94,0.06)',
          color: isYes ? '#ef4444' : '#22c55e',
        }}
      >
        {isYes ? 'YES' : 'NO'}
      </span>
    </div>
  )
}

// ─── Panel ──────────────────────────────────────────────────────────────────

interface Props {
  patient: Patient
}

export function ComplicationsPanel({ patient }: Props) {
  const tapvrLabel = [
    'Absent',
    'Present (not repaired)',
    'Concurrent repair',
  ][patient.tapvrClass]

  const comps: CompRow[] = [
    { label: 'Chylothorax intervention', value: patient.compChylo },
    { label: 'Low cardiac output (LCOS)', value: patient.compLCOS },
    { label: 'Cardiac arrest / ECPR', value: patient.compArrest },
    { label: 'Sepsis', value: patient.compSepsis },
    { label: 'Open sternum', value: patient.openSternum },
    { label: 'Nitric oxide therapy', value: patient.nitricOxide },
    { label: 'NCAA lungs finding', value: patient.ncaaLungs },
  ]

  const glance = (
    <div className="space-y-2">
      {comps.slice(0, 5).map(c => (
        <CompPill key={c.label} {...c} />
      ))}

      <p
        style={{
          fontSize: 8,
          color: 'rgba(0,0,0,0.3)',
          marginTop: 4,
        }}
      >
        Showing 5 of {comps.length} · expand for full profile
      </p>
    </div>
  )

  const detail = (
    <div className="space-y-4">

      <p className="label-micro">All complications</p>

      <div className="space-y-2">
        {comps.map(c => (
          <CompPill key={c.label} {...c} />
        ))}
      </div>

      {/* Procedure section */}
      <div
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: 12,
        }}
      >
        <p className="label-micro mb-2">Procedure details</p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'CPB time', value: `${patient.cpbMinutes} min` },
            { label: 'XClamp', value: `${patient.xclampMinutes} min` },
            { label: 'Shunt size', value: `${patient.shuntSizeMm} mm` },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 12,
                padding: 10,
                textAlign: 'center',
              }}
            >
              <p className="label-micro mb-1">{stat.label}</p>
              <p style={{ fontSize: 14, fontWeight: 300 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* TAPVR card */}
        <div
          style={{
            marginTop: 10,
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)' }}>
              TAPVR repair status
            </span>

            <span
              style={{
                fontSize: 8,
                padding: '2px 8px',
                borderRadius: 999,
                border:
                  patient.tapvrClass === 2
                    ? '1px solid rgba(59,130,246,0.25)'
                    : patient.tapvrClass === 1
                    ? '1px solid rgba(245,158,11,0.25)'
                    : '1px solid rgba(0,0,0,0.08)',
                background:
                  patient.tapvrClass === 2
                    ? 'rgba(59,130,246,0.08)'
                    : patient.tapvrClass === 1
                    ? 'rgba(245,158,11,0.08)'
                    : 'rgba(0,0,0,0.04)',
                color:
                  patient.tapvrClass === 2
                    ? '#3b82f6'
                    : patient.tapvrClass === 1
                    ? '#f59e0b'
                    : 'rgba(0,0,0,0.45)',
              }}
            >
              {tapvrLabel}
            </span>
          </div>

          {patient.tapvrClass === 2 && (
            <p style={{ fontSize: 9, color: '#3b82f6', marginTop: 6 }}>
              Concurrent repair is a protective factor (−41% SHAP contribution)
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <BasePanel
      panelId="complications"
      title="Surgical & complication profile"
      detail={detail}
    >
      {glance}
    </BasePanel>
  )
}