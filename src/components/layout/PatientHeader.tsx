/**
 * PatientHeader.tsx
 * Cream UI refactor — patient identity + risk at-a-glance
 */

import type { Patient } from '../../data/patients'

function riskStyle(score: number) {
  if (score >= 0.65)
    return {
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.06)',
    }

  if (score >= 0.4)
    return {
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.06)',
    }

  return {
    border: 'rgba(34, 197, 94, 0.25)',
    text: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.05)',
  }
}

interface Props {
  patient: Patient
}

export function PatientHeader({ patient }: Props) {
  const s = riskStyle(patient.riskScore)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
      className="px-6 py-4 flex items-center gap-8"
    >
      {/* Accent bar (softened) */}
      <div
        style={{
          width: 4,
          height: 40,
          borderRadius: 999,
          background: 'rgba(59, 130, 246, 0.5)',
          flexShrink: 0,
        }}
      />

      {/* ID + gender */}
      <div>
        <p className="label-micro mb-0.5">ID & gender</p>
        <p className="text-lg font-light text-[var(--color-text-primary)]">
          {patient.gender === 'M' ? '♂' : '♀'} #{patient.id}
        </p>
      </div>

      <div
        style={{
          width: 1,
          height: 32,
          background: 'var(--color-border)',
        }}
      />

      {/* Birth / gestational age */}
      <div>
        <p className="label-micro mb-0.5">Birth wt / gest age</p>
        <p className="text-lg font-light text-[var(--color-text-primary)]">
          {patient.birthWeightKg}kg / {patient.gestAgeWeeks}w
        </p>
      </div>

      <div
        style={{
          width: 1,
          height: 32,
          background: 'var(--color-border)',
        }}
      />

      {/* Diagnosis */}
      <div>
        <p className="label-micro mb-0.5">Primary diagnosis</p>
        <p className="text-base font-light text-[var(--color-text-primary)]">
          {patient.diagnosisShort}
        </p>
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        {patient.premature && (
          <span
            style={{
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 999,
              border: '1px solid rgba(245, 158, 11, 0.25)',
              background: 'rgba(245, 158, 11, 0.06)',
              color: '#f59e0b',
            }}
          >
            Premature ({patient.gestAgeWeeks}w)
          </span>
        )}

        {patient.syndrome && (
          <span
            style={{
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 999,
              border: '1px solid rgba(168, 85, 247, 0.25)',
              background: 'rgba(168, 85, 247, 0.06)',
              color: '#a855f7',
            }}
          >
            Syndrome
          </span>
        )}

        <span
          style={{
            fontSize: 9,
            padding: '2px 8px',
            borderRadius: 999,
            border: '1px solid var(--color-border)',
            background: 'rgba(0,0,0,0.02)',
            color: 'var(--color-text-muted)',
          }}
        >
          {patient.shuntType} shunt
        </span>
      </div>

      {/* Risk score (right aligned) */}
      <div
        style={{
          marginLeft: 'auto',
          flexShrink: 0,
          padding: '10px 16px',
          borderRadius: 12,
          border: `1px solid ${s.border}`,
          background: s.bg,
          textAlign: 'center',
          minWidth: 140,
        }}
      >
        <p style={{ fontSize: 22, fontWeight: 300, color: s.text }}>
          {Math.round(patient.riskScore * 100)}%
          <span style={{ fontSize: 14, marginLeft: 4 }}>risk</span>
        </p>

        <p className="label-micro mt-0.5">
          Model confidence: {patient.modelConfidence.toFixed(2)}
        </p>
      </div>
    </div>
  )
}