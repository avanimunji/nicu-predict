/**
 * RiskScorePanel.tsx
 * Creamy UI refactor (Notion / Linear / Apple Health style)
 */

import { BasePanel } from '../ui/BasePanel'
import type { Patient } from '../../data/patients'

// ─── Risk color system (softened, non-neon) ────────────────────────────────

function riskColor(score: number) {
  if (score >= 0.65)
    return {
      color: "var(--color-red)",
      bg: "rgba(228, 88, 88, 0.08)",
      label: "HIGH RISK",
    }

  if (score >= 0.4)
    return {
      color: "#e6a23c",
      bg: "rgba(230, 162, 60, 0.08)",
      label: "MODERATE",
    }

  return {
    color: "var(--color-blue)",
    bg: "rgba(79, 124, 255, 0.08)",
    label: "LOW RISK",
  }
}

// ─── Arc Gauge (softened visual language) ──────────────────────────────────

function ArcGauge({ score }: { score: number }) {
  const R = 44
  const cx = 60
  const cy = 56
  const total = Math.PI * R
  const filled = total * score
  const gap = total - filled

  const col = riskColor(score)

  return (
    <svg viewBox="0 0 120 64" className="w-full">
      {/* Track */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Fill */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none"
        stroke={col.color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />

      {/* Score */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill={col.color}
        fontSize="18"
        fontWeight="300"
        fontFamily="DM Mono, monospace"
      >
        {Math.round(score * 100)}%
      </text>

      {/* Label */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize="7"
        fontFamily="DM Mono, monospace"
      >
        {col.label}
      </text>
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  patient: Patient
}

export function RiskScorePanel({ patient }: Props) {
  const col = riskColor(patient.riskScore)

  const glance = (
    <div className="space-y-4">

      {/* Gauge */}
      <div className="px-2">
        <ArcGauge score={patient.riskScore} />
      </div>

      {/* Confidence row */}
      <div className="flex items-center justify-between text-[10px]">
        <span style={{ color: "var(--color-text-muted)" }}>
          Model confidence
        </span>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
          {patient.modelConfidence.toFixed(2)}
        </span>
      </div>

      {/* Insight card (soft pill replacement) */}
      <div
        style={{
          borderRadius: 12,
          padding: 12,
          fontSize: 10,
          lineHeight: 1.5,
          background: col.bg,
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 6,
            color: col.color,
          }}
        >
          Critical insight
        </p>

        <p style={{ color: "var(--color-text-secondary)" }}>
          {patient.criticalInsight}
        </p>
      </div>
    </div>
  )

  const detail = (
    <div className="space-y-4">

      {/* Clinical synthesis */}
      <div>
        <p className="label-micro mb-2">Clinical synthesis</p>

        <p
          style={{
            fontSize: 15,
            fontStyle: "italic",
            fontFamily: "Instrument Serif, serif",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          "{patient.clinicalSummary}"
        </p>
      </div>

      {/* Recommendation card */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <p className="label-micro mb-1.5">Recommendation</p>

        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {patient.recommendation}
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 10,
          color: "var(--color-text-muted)",
          paddingTop: 4,
        }}
      >
        <span>
          P-value: <strong style={{ color: "var(--color-text-secondary)" }}>&lt; 0.001</strong>
        </span>
        <span>N=157 cohort</span>
        <span style={{ marginLeft: "auto" }}>XGBoost v2.1</span>
      </div>
    </div>
  )

  return (
    <BasePanel panelId="risk_score" title="Risk score" detail={detail}>
      {glance}
    </BasePanel>
  )
}