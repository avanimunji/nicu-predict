/**
 * CohortBenchmarkPanel.tsx
 * Light / creamy tuned version (Notion / Linear / Apple Health style)
 */

import { BasePanel } from '../ui/BasePanel.tsx'
import type { Patient } from '../../data/patients.ts'

// Cohort medians and IQRs
const COHORT = {
  birthWeightKg:      { q1: 2.2, median: 3.0, q3: 3.5, unit: 'kg',  label: 'Birth weight' },
  gestAgeWeeks:       { q1: 35,  median: 38,  q3: 39,  unit: 'wk',  label: 'Gestational age' },
  ageAtSurgeryDays:   { q1: 10,  median: 28,  q3: 50,  unit: 'd',   label: 'Age at surgery' },
  surgWeightKg:       { q1: 2.5, median: 3.1, q3: 3.8, unit: 'kg',  label: 'Surgery weight' },
  shuntToWeight:      { q1: 0.9, median: 1.2, q3: 1.8, unit: 'mm/kg', label: 'Shunt / weight' },
  cpbMinutes:         { q1: 72,  median: 95,  q3: 130, unit: 'min', label: 'CPB time' },
}

type CohortKey = keyof typeof COHORT

function position(val: number, q1: number, q3: number): number {
  const lo = q1 * 0.5
  const hi = q3 * 1.5
  return Math.min(100, Math.max(0, ((val - lo) / (hi - lo)) * 100))
}

function outlierFlag(val: number, q1: number, q3: number): 'low' | 'high' | null {
  if (val < q1) return 'low'
  if (val > q3) return 'high'
  return null
}

function RangeBar({
  label, value, unit, q1, median, q3,
}: {
  label: string; value: number; unit: string; q1: number; median: number; q3: number;
}) {
  const pos  = position(value, q1, q3)
  const flag = outlierFlag(value, q1, q3)

  const dotColor =
    flag === 'low'
      ? 'var(--color-blue)'
      : flag === 'high'
      ? 'var(--color-red)'
      : 'var(--color-amber)'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[10px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
        </span>

        <div className="flex items-center gap-2">
          {flag && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 999,
                background: `${dotColor}12`,
                color: dotColor,
              }}
            >
              {flag === 'low' ? 'Below Q1' : 'Above Q3'}
            </span>
          )}

          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {value}
            <span
              className="text-[10px] font-normal"
              style={{ color: "var(--color-text-muted)" }}
            >
              {" "}{unit}
            </span>
          </span>
        </div>
      </div>

      {/* Track */}
      <div
        className="relative h-3 rounded-full"
        style={{ background: "var(--color-fill-subtle)" }}
      >
        {/* IQR band */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            background: "var(--color-fill-muted)",
            left:  `${position(q1, q1, q3) * 0.5}%`,
            width: `${position(q3, q1, q3) * 0.5 - position(q1, q1, q3) * 0.5}%`,
          }}
        />

        {/* Median tick */}
        <div
          className="absolute top-0 h-full w-px"
          style={{
            background: "rgba(0,0,0,0.15)",
            left: `${position(median, q1, q3)}%`,
          }}
        />

        {/* Patient dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full -ml-1.5"
          style={{
            left: `${pos}%`,
            background: dotColor,
            border: "2px solid var(--color-surface)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            transition: "all 0.5s",
          }}
        />
      </div>

      {/* Scale labels */}
      <div
        className="flex justify-between mt-1 text-[10px]"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>Q1 {q1}{unit}</span>
        <span>Median {median}{unit}</span>
        <span>Q3 {q3}{unit}</span>
      </div>
    </div>
  )
}

interface Props { patient: Patient }

export function CohortBenchmarkPanel({ patient }: Props) {
  const glanceKeys: CohortKey[] = ['birthWeightKg', 'ageAtSurgeryDays', 'shuntToWeight']
  const allKeys    = Object.keys(COHORT) as CohortKey[]

  const patientValues: Record<CohortKey, number> = {
    birthWeightKg:    patient.birthWeightKg,
    gestAgeWeeks:     patient.gestAgeWeeks,
    ageAtSurgeryDays: patient.ageAtSurgeryDays,
    surgWeightKg:     patient.surgWeightKg,
    shuntToWeight:    patient.shuntToWeight,
    cpbMinutes:       patient.cpbMinutes,
  }

  const glance = (
    <div className="space-y-4">
      {glanceKeys.map(key => {
        const c = COHORT[key]
        return (
          <RangeBar
            key={key}
            label={c.label}
            value={patientValues[key]}
            unit={c.unit}
            q1={c.q1}
            median={c.median}
            q3={c.q3}
          />
        )
      })}

      <p
        className="text-[10px]"
        style={{ color: "var(--color-text-muted)" }}
      >
        Dot = patient · band = IQR · tick = median · expand for all
      </p>
    </div>
  )

  const detail = (
    <div className="space-y-4">
      <p className="label-micro">All benchmarked metrics</p>

      {allKeys.map(key => {
        const c = COHORT[key]
        return (
          <RangeBar
            key={key}
            label={c.label}
            value={patientValues[key]}
            unit={c.unit}
            q1={c.q1}
            median={c.median}
            q3={c.q3}
          />
        )
      })}

      <div
        className="text-[9px] pt-3"
        style={{
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-fill-subtle)",
        }}
      >
        Cohort n=157 · IQR from study dataset · Outlier = outside Q1–Q3
      </div>
    </div>
  )

  return (
    <BasePanel panelId="cohort_benchmark" title="Cohort benchmarking" detail={detail}>
      {glance}
    </BasePanel>
  )
}