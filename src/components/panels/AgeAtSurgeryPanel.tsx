// AgeAtSurgeryPanel.tsx
// Drop into your src/components/panels/ directory
// Dependencies: recharts, lucide-react, tailwindcss
// Expects: BasePanel, useTracking from your project (stubs included at bottom of file)

import { useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Info, X, TrendingDown, AlertTriangle, Users } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Patient {
  id: string;
  ageAtSurgeryDays: number;
  ageAtSurgeryMonths: number;
  diagnosis: string;
  hadOcclusion: boolean | null; // null = current patient (unknown outcome)
}

interface AgeAtSurgeryPanelProps {
  patient: Patient;
  panelId?: string;
  defaultExpanded?: boolean;
  onTrack?: (event: { event_type: string; panel_id: string }) => void;
  onIncrementClick?: (panelId: string) => void;
}

// ─── Kernel Density Estimation (generates smooth distribution) ───────────────

function gaussianKDE(
  data: number[],
  bandwidth: number,
  points: number[]
): number[] {
  return points.map((x) => {
    const sum = data.reduce((acc, xi) => {
      const z = (x - xi) / bandwidth;
      return acc + Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    }, 0);
    return sum / (data.length * bandwidth);
  });
}

// ─── Cohort data (mock — replace with real API call) ────────────────────────

// Ages at surgery in days for each group
const NO_OCCLUSION_AGES = [
  18, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65,
  68, 70, 72, 38, 41, 44, 47, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57,
];

const OCCLUSION_AGES = [
  5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 12, 14, 16, 9, 11, 13, 10, 15,
  8, 12, 14, 6, 9, 11,
];

const AVG_NO_OCCLUSION = Math.round(
  NO_OCCLUSION_AGES.reduce((a, b) => a + b, 0) / NO_OCCLUSION_AGES.length
);
const AVG_OCCLUSION = Math.round(
  OCCLUSION_AGES.reduce((a, b) => a + b, 0) / OCCLUSION_AGES.length
);

// Build KDE chart data
function buildChartData(patientAge: number) {
  const xMin = 0;
  const xMax = 90;
  const steps = 91;
  const xPoints = Array.from({ length: steps }, (_, i) => i);

  const noOccDensity = gaussianKDE(NO_OCCLUSION_AGES, 5, xPoints);
  const occDensity = gaussianKDE(OCCLUSION_AGES, 3.5, xPoints);

  // Normalize to percentage-ish scale for readability
  const maxDens = Math.max(...noOccDensity, ...occDensity);
  const scale = 100 / maxDens;

  return xPoints.map((x) => ({
    day: x,
    noOcclusion: parseFloat((noOccDensity[x] * scale).toFixed(3)),
    occlusion: parseFloat((occDensity[x] * scale).toFixed(3)),
  }));
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
  
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-fill-subtle)] rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-[var(--color-text-secondary)] mb-1">
          Day {label}
        </p>
  
        {payload.map((p: any) => (
          <p
            key={p.dataKey}
            className="font-medium"
            style={{ color: p.color }} // keep signal color
          >
            {p.name}:{" "}
            <span className="text-[var(--color-text-primary)]">
              {p.value.toFixed(2)}%
            </span>
          </p>
        ))}
      </div>
    );
  }

// ─── Percentile badge ────────────────────────────────────────────────────────

function getPercentile(age: number, dataset: number[]): number {
  const below = dataset.filter((a) => a < age).length;
  return Math.round((below / dataset.length) * 100);
}

function getRiskContext(age: number) {
    if (age <= AVG_OCCLUSION)
      return {
        label: "Within occlusion peak",
        color: "var(--color-red)",
        bg: "bg-red-500/10 border-red-500/20",
        icon: <AlertTriangle size={12} />,
        detail: `Patient's surgery age (${age}d) is at or below peak risk window.`,
      };
  
    if (age <= AVG_OCCLUSION + 8)
      return {
        label: "Approaching average",
        color: "var(--color-amber)",
        bg: "bg-amber-500/10 border-amber-500/20",
        icon: <TrendingDown size={12} />,
        detail: `Surgery at ${age}d is slightly above peak risk.`,
      };
  
    return {
      label: "Near no-occlusion avg",
      color: "var(--color-green)",
      bg: "bg-green-500/10 border-green-500/20",
      icon: <Users size={12} />,
      detail: `Surgery at ${age}d is within lower-risk cohort range.`,
    };
  }

// ─── Expanded detail content ─────────────────────────────────────────────────

function DetailView({ patient, chartData }: { patient: Patient; chartData: ReturnType<typeof buildChartData> }) {
  const occPct = getPercentile(patient.ageAtSurgeryDays, OCCLUSION_AGES);
  const noOccPct = getPercentile(patient.ageAtSurgeryDays, NO_OCCLUSION_AGES);

  return (
    <div className="space-y-4">
      {/* Distribution chart */}
      <div>
        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
          Cohort distribution — age at surgery (days)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradNoOcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 15, 30, 45, 60, 75, 90]}
              tickFormatter={(v) => `${v}d`}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            {/* Average lines */}
            <ReferenceLine
              x={AVG_NO_OCCLUSION}
              stroke="#3b82f6"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: `avg ${AVG_NO_OCCLUSION}d`, fill: "#3b82f6", fontSize: 8, position: "top" }}
            />
            <ReferenceLine
              x={AVG_OCCLUSION}
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: `avg ${AVG_OCCLUSION}d`, fill: "#ef4444", fontSize: 8, position: "top" }}
            />
            {/* Patient marker */}
            <ReferenceLine
              x={patient.ageAtSurgeryDays}
              stroke="#f59e0b"
              strokeWidth={2}
              label={{
                value: `★ ${patient.ageAtSurgeryDays}d`,
                fill: "#f59e0b",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />
            <Area
              type="monotone"
              dataKey="noOcclusion"
              name="No occlusion"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fill="url(#gradNoOcc)"
              dot={false}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="occlusion"
              name="With occlusion"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="url(#gradOcc)"
              dot={false}
              activeDot={false}
            />
            <Legend
              iconType="line"
              iconSize={12}
              wrapperStyle={{ fontSize: 9, paddingTop: 6, color: "rgba(255,255,255,0.4)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Percentile cards */}
        <div className="grid grid-cols-2 gap-2">
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
        <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
        vs occlusion cohort
        </p>

        <p className="text-2xl font-light text-red-400">
        {occPct}
        <span className="text-xs font-normal text-[var(--color-text-secondary)]">
            th pct
        </span>
        </p>

        <p className="text-[9px] text-[var(--color-text-muted)] mt-1">
        {occPct}% of occlusion patients had surgery later than this patient
        </p>
    </div>

    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
        <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
        vs no-occlusion cohort
        </p>

        <p className="text-2xl font-light text-blue-400">
        {noOccPct}
        <span className="text-xs font-normal text-[var(--color-text-secondary)]">
            th pct
        </span>
        </p>

        <p className="text-[9px] text-[var(--color-text-muted)] mt-1">
        {noOccPct}% of no-occlusion patients had surgery later than this patient
        </p>
    </div>
    </div>

      {/* Stat row */}
      <div className="flex gap-4 text-[10px] text-white/35 border-t border-white/[0.06] pt-3">
        <span>No-occlusion cohort n=<strong className="text-white/60">{NO_OCCLUSION_AGES.length}</strong></span>
        <span>Occlusion cohort n=<strong className="text-white/60">{OCCLUSION_AGES.length}</strong></span>
        <span className="ml-auto">Feature importance rank: <strong className="text-amber-400">#2</strong></span>
      </div>
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export function AgeAtSurgeryPanel({
    patient,
    panelId = "age_at_surgery",
    defaultExpanded = false,
    onTrack,
    onIncrementClick,
    }: AgeAtSurgeryPanelProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const chartData = buildChartData(patient.ageAtSurgeryDays);
    const riskCtx = getRiskContext(patient.ageAtSurgeryDays);

    // Mini sparkline data for the collapsed glance view (just last 10 pts of each curve around the patient)
    const miniData = chartData.slice(
        Math.max(0, patient.ageAtSurgeryDays - 20),
        Math.min(90, patient.ageAtSurgeryDays + 30)
    );

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next) {
        onTrack?.({ event_type: "panel_expand", panel_id: panelId });
        onIncrementClick?.(panelId);
        }
    };

    const handleMouseEnter = () => {
        hoverTimer.current = setTimeout(() => {
        onTrack?.({ event_type: "panel_hover", panel_id: panelId });
        }, 1500);
    };

    const handleMouseLeave = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };

    return (
        <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
            relative bg-[#fbf8f3] border rounded-xl p-4 transition-all duration-300
            ${expanded ? "border-white/15" : "border-white/[0.07] hover:border-white/12"}
        `}
        >
        {/* Header row */}
    <div className="flex items-start justify-between mb-3">
    <div>
        <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-medium mb-1">
        Age at surgery
        </p>

        {/* Big number */}
        <div className="flex items-baseline gap-2">
        <span className="text-3xl font-light text-[var(--color-text-primary)] tabular-nums">
            {patient.ageAtSurgeryDays}
        </span>

        <span className="text-sm text-[var(--color-text-secondary)]">days</span>

        <span className="text-[var(--color-text-faint)] text-sm">/</span>

        <span className="text-sm text-[var(--color-text-secondary)]">
            {patient.ageAtSurgeryMonths.toFixed(1)} mo
        </span>
        </div>
    </div>

    {/* Risk badge + info button */}
    <div className="flex items-center gap-2">
        <div
        className={`flex items-center gap-1 border rounded-full px-2 py-1 text-[9px] font-medium ${riskCtx.bg}`}
        style={{ color: riskCtx.color }}
        >
        {riskCtx.icon}
        {riskCtx.label}
        </div>

        <button
        onClick={handleExpand}
        className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors"
        aria-label={expanded ? "Collapse panel" : "Expand panel"}
        >
        {expanded ? <X size={11} /> : <Info size={11} />}
        </button>
    </div>
    </div>

      {/* ── Glance view (always visible) ── */}
      <div className="space-y-2">
        {/* Mini distribution preview */}
        <div className="relative h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="miniGradNoOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="miniGradOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ReferenceLine
                x={patient.ageAtSurgeryDays}
                stroke="#f59e0b"
                strokeWidth={1.5}
              />
              <Area type="monotone" dataKey="noOcclusion" stroke="#3b82f6" strokeWidth={1} fill="url(#miniGradNoOcc)" dot={false} />
              <Area type="monotone" dataKey="occlusion" stroke="#ef4444" strokeWidth={1} fill="url(#miniGradOcc)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Patient label over chart */}
          <span className="absolute bottom-1 right-1 text-[8px] text-amber-400/70">▲ this patient</span>
        </div>

        {/* Comparison pills */}
        <div className="flex gap-2 text-[9px]">
          <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
            <span className="inline-block w-2 h-[2px] bg-red-400 rounded" />
            Avg w/ occlusion: <strong className="text-[var(--color-text-secondary)] ml-1">{AVG_OCCLUSION}d</strong>
          </span>
          <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
            <span className="inline-block w-2 h-[2px] bg-blue-400 rounded" />
            Avg no occlusion: <strong className="text-[var(--color-text-secondary)] ml-1">{AVG_NO_OCCLUSION}d</strong>
          </span>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.07]">
          <DetailView patient={patient} chartData={chartData} />
        </div>
      )}

      {/* Context blurb (always visible at bottom) */}
      <p className="mt-3 text-[9px] text-[var(--color-text-muted)] leading-relaxed">
        {riskCtx.detail}
      </p>
    </div>
  );
}

// ─── Usage example / demo wrapper (remove in production) ────────────────────

export function AgeAtSurgeryPanelDemo() {
  // Simulates the patient prop that would come from your Zustand store
  const mockPatient: Patient = {
    id: "4492-X",
    ageAtSurgeryDays: 12,
    ageAtSurgeryMonths: 0.4,
    diagnosis: "HLHS (Sano Shunt)",
    hadOcclusion: null,
  };

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center p-8">
      <div className="w-80">
        <AgeAtSurgeryPanel
          patient={mockPatient}
          onTrack={(e) => console.log("track:", e)}
          onIncrementClick={(id) => console.log("increment:", id)}
        />
      </div>
    </div>
  );
}