/**
 * BasePanel.tsx
 * The shared shell for every dashboard panel.
 * Handles: expand/collapse state, ⓘ button, hover tracking, click counting.
 *
 * Usage:
 *   <BasePanel panelId="age_at_surgery" title="Age at surgery" detail={<DetailView />}>
 *     <GlanceView />
 *   </BasePanel>
 */

import { useEffect, useState } from 'react'
import { Info, X } from 'lucide-react'
import { useTracking } from '../../hooks/useTracking'
import { useUserStore } from '../../store/userStore'

interface BasePanelProps {
  panelId: string
  title: string
  children: React.ReactNode
  detail?: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function BasePanel({
  panelId,
  title,
  children,
  detail,
  defaultExpanded = false,
  className = '',
}: BasePanelProps) {

  const { track, trackHover, cancelHover, incrementPanelClick } = useTracking()
  const panelPrefs = useUserStore(s => s.panelPrefs)

  // ✅ IMPORTANT: derive initial state ONCE
  const [expanded, setExpanded] = useState(() => {
    return defaultExpanded || panelPrefs.autoExpand.includes(panelId)
  })

  // optional: update if prefs load late (only ONCE per panel)
  useEffect(() => {
    if (panelPrefs.autoExpand.includes(panelId)) {
      setExpanded(true)
    }
  }, [panelPrefs.autoExpand, panelId])

  const handleToggle = () => {
    const next = !expanded
    setExpanded(next)

    if (next) {
      track({ event_type: 'panel_expand', panel_id: panelId })
      incrementPanelClick(panelId)
    }
  }

  const handleClose = () => {
    setExpanded(false)
  }

  return (
    <div
      onMouseEnter={() => trackHover(panelId)}
      onMouseLeave={() => cancelHover(panelId)}
      className={`panel-card ${expanded ? 'border-white/15' : ''} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="label-micro">{title}</span>

        {detail && (
          <button onClick={expanded ? handleClose : handleToggle} className="info-btn">
            {expanded ? <X size={11} /> : <Info size={11} />}
          </button>
        )}
      </div>

      {/* Glance */}
      {children}

      {/* Detail */}
      {expanded && detail && (
        <div className="mt-4 pt-4 border-t border-white/[0.07] animate-[fadeIn_0.2s_ease]">
          {detail}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}