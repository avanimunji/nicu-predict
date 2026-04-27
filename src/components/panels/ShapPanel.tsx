/**
 * ShapPanel.tsx
 * Cream UI refactor — preserves SHAP signal integrity
 */

import { BasePanel } from '../ui/BasePanel'
import type { Patient, ShapFeature } from '../../data/patients'

// ─── Feature bar ────────────────────────────────────────────────────────────

function FeatureBar({
  feature,
  maxVal,
  rank,
}: {
  feature: ShapFeature
  maxVal: number
  rank: number
}) {
  const pct = Math.abs(feature.value) / maxVal * 100
  const isRisk = feature.direction === 'risk'

  const color = isRisk ? '#ef4444' : '#3b82f6'

  const bgPill = isRisk
    ? 'rgba(239, 68, 68, 0.08)'
    : 'rgba(59, 130, 246, 0.08)'

  const borderPill = isRisk
    ? 'rgba(239, 68, 68, 0.2)'
    : 'rgba(59, 130, 246, 0.2)'

  return (
    <div className="flex items-center gap-3 group">

      {/* Rank */}
      <span
        style={{
          fontSize: 9,
          color: 'var(--color-text-muted)',
          width: 12,
          textAlign: 'right',
        }}
      >
        {rank}
      </span>

      {/* Feature label */}
      <div style={{ width: 120, flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
          {feature.name}
        </p>

        <p style={{ fontSize: 8, color: 'var(--color-text-muted)' }}>
          {feature.displayVal}
        </p>
      </div>

      {/* Bar */}
      <div
        style={{
          flex: 1,
          height: 10,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            opacity: 0.75,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* ✅ NEW: percentage OUTSIDE bar */}
      <span
        style={{
          fontSize: 8,
          color,
          fontWeight: 500,
          width: 40,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {isRisk ? '+' : ''}
        {(feature.value * 100).toFixed(0)}%
      </span>

      {/* Direction pill */}
      <span
        style={{
          fontSize: 8,
          padding: '2px 6px',
          borderRadius: 999,
          border: `1px solid ${borderPill}`,
          background: bgPill,
          color,
          flexShrink: 0,
        }}
      >
        {isRisk ? 'risk' : 'prot.'}
      </span>
    </div>
  )
}

// ─── Panel ──────────────────────────────────────────────────────────────────

interface Props {
  patient: Patient
}

export function ShapPanel({ patient }: Props) {
  const features = patient.shapFeatures

  const maxVal = Math.max(...features.map(f => Math.abs(f.value)))
  const topFive = features.slice(0, 5)

  const glance = (
    <div className="space-y-3">

      {/* Legend */}
      <div className="flex gap-4 text-[9px] text-[var(--color-text-muted)] mb-2">
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: 2 }} />
          Risk-increasing
        </span>

        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: 2 }} />
          Protective
        </span>
      </div>

      {/* Top 5 */}
      {topFive.map((f, i) => (
        <FeatureBar
          key={f.name}
          feature={f}
          maxVal={maxVal}
          rank={i + 1}
        />
      ))}

      <p
        style={{
          fontSize: 8,
          color: 'var(--color-text-muted)',
          marginTop: 6,
        }}
      >
        Showing top 5 contributors · expand for full model explanation
      </p>
    </div>
  )

  const detail = (
    <div className="space-y-3">

      <p className="label-micro">All SHAP features</p>

      {features.map((f, i) => (
        <FeatureBar
          key={f.name}
          feature={f}
          maxVal={maxVal}
          rank={i + 1}
        />
      ))}

      <div
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="label-micro mb-2">How to read this</p>

        <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Each feature shows how strongly it pushed the model risk score up (red)
          or down (blue). These are SHAP values — they represent local feature
          contributions that sum to the final prediction for this patient.
        </p>
      </div>
    </div>
  )

  return (
    <BasePanel
      panelId="shap"
      title="Primary risk drivers · SHAP"
      detail={detail}
    >
      {glance}
    </BasePanel>
  )
}