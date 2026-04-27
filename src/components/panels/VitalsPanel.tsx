/**
 * VitalsPanel.tsx
 * Creamy UI refactor — preserves clinical color semantics + chart integrity
 */

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
  } from 'recharts'
  
  import { BasePanel } from '../ui/BasePanel'
  import type { Patient } from '../../data/patients'
  
  // ─── Reference ranges ───────────────────────────────────────────────────────
  
  const RANGES = {
    hr:   { low: 100, high: 170, target: 140, unit: 'bpm',  label: 'Heart rate' },
    spo2: { low: 75,  high: 100, target: 92,   unit: '%',    label: 'SpO₂' },
    mbp:  { low: 35,  high: 75,  target: 50, unit: 'mmHg', label: 'Mean BP' },
  }
  
  // ─── Status logic (UNCHANGED — clinically important) ────────────────────────
  
  function statusOf(key: 'hr' | 'spo2' | 'mbp', val: number) {
    const r = RANGES[key]
  
    if (key === 'spo2' && r.target && val < r.target) return 'warn'
    if (val < r.low || val > r.high) return 'crit'
    return 'ok'
  }
  
  // KEEPING ORIGINAL SIGNAL COLORS (important)
  const STATUS = {
    ok:   { color: '#22c55e', label: 'Stable' },   // green
    warn: { color: '#f59e0b', label: 'Target' },   // amber
    crit: { color: '#ef4444', label: 'Alert' },    // red
  }
  
  // ─── Trend indicator (unchanged meaning) ────────────────────────────────────
  
  function Trend({ current, prev }: { current: number; prev: number }) {
    const delta = current - prev
  
    if (Math.abs(delta) < 1)
      return <span className="text-[9px] text-black/30">—</span>
  
    const up = delta > 0
  
    return (
      <span
        className="text-[9px]"
        style={{
          color: up ? '#ef4444' : '#3b82f6',
        }}
      >
        {up ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
      </span>
    )
  }
  
  // ─── Vital card (soft surface, preserved colors) ────────────────────────────
  
  function VitalCard({
    label,
    value,
    unit,
    status,
    prev,
  }: {
    label: string
    value: number
    unit: string
    status: 'ok' | 'warn' | 'crit'
    prev: number
  }) {
    const s = STATUS[status]
  
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(15, 17, 23, 0.08)',
          borderRadius: 14,
          padding: 12,
          boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="label-micro">{label}</span>
  
          <span
            style={{
              fontSize: 8,
              padding: '2px 6px',
              borderRadius: 999,
              border: `1px solid ${s.color}33`,
              background: `${s.color}10`,
              color: s.color,
            }}
          >
            {s.label}
          </span>
        </div>
  
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: s.color,
            }}
          >
            {value}
          </span>
  
          <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)' }}>
            {unit}
          </span>
  
          <Trend current={value} prev={prev} />
        </div>
      </div>
    )
  }
  
  // ─── Tooltip (clean, no dark inversion) ─────────────────────────────────────
  
  function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
  
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 10,
          padding: '6px 10px',
          fontSize: 10,
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>
          {label}
        </p>
  
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.stroke }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  
  // ─── Main panel ─────────────────────────────────────────────────────────────
  
  interface Props {
    patient: Patient
  }
  
  export function VitalsPanel({ patient }: Props) {
    const v = patient.vitals
    const hist = patient.vitalHistory
    const prev = hist[hist.length - 2] ?? hist[0]
  
    const glance = (
      <div className="space-y-2">
        <VitalCard
          label="Heart rate"
          value={v.hr}
          unit="bpm"
          status={statusOf('hr', v.hr)}
          prev={prev.hr}
        />
  
        <VitalCard
          label="SpO₂"
          value={v.spo2}
          unit="%"
          status={statusOf('spo2', v.spo2)}
          prev={prev.spo2}
        />
  
        <VitalCard
          label="Mean BP"
          value={v.mbp}
          unit="mmHg"
          status={statusOf('mbp', v.mbp)}
          prev={prev.mbp}
        />
      </div>
    )
  
    const detail = (
      <div className="space-y-5">
  
        <p className="label-micro">4-hour trend</p>
  
        {/* SpO₂ */}
        <div>
          <p className="text-[9px] text-black/40 mb-2">SpO₂ (%)</p>
  
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={hist}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <XAxis hide />
              <YAxis domain={[70, 100]} hide />
              <Tooltip content={<CustomTooltip />} />
  
              <ReferenceLine
                y={92}
                stroke="#f59e0b"
                strokeDasharray="3 2"
                strokeWidth={1}
              />
  
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        {/* HR */}
        <div>
          <p className="text-[9px] text-black/40 mb-2">Heart rate</p>
  
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={hist}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <XAxis hide />
              <YAxis domain={[110, 160]} hide />
              <Tooltip content={<CustomTooltip />} />
  
              <Line
                type="monotone"
                dataKey="hr"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        {/* MBP */}
        <div>
          <p className="text-[9px] text-black/40 mb-2">Mean BP</p>
  
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={hist}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <XAxis hide />
              <YAxis domain={[30, 70]} hide />
              <Tooltip content={<CustomTooltip />} />
  
              <Line
                type="monotone"
                dataKey="mbp"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        {/* Footer */}
        <div
          style={{
            fontSize: 9,
            color: 'rgba(0,0,0,0.35)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 8,
          }}
        >
          Pulse pressure: <strong>{v.pp} mmHg</strong> · continuous monitoring
        </div>
      </div>
    )
  
    return (
      <BasePanel panelId="vitals" title="Vital statistics · live" detail={detail}>
        {glance}
      </BasePanel>
    )
  }