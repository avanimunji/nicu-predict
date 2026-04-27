/**
 * useTracking.ts
 * Wraps analytics.ts and Supabase RPC calls.
 * Used by every panel to record interactions.
 */

import { useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'
import { recordPanelEvent } from '../lib/analytics'

type EventType = 'panel_expand' | 'panel_hover' | 'patient_switch' | 'tab_view'

interface TrackEvent {
  event_type: EventType
  panel_id:   string
  patient_id?: string
}

export function useTracking() {
  const userId = useUserStore(s => s.userId)
  const hoverTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const track = useCallback((event: TrackEvent) => {
    if (!userId) return
    // Fire-and-forget — don't await in render path
    recordPanelEvent(event.panel_id, event.event_type)
  }, [userId])

  /**
   * Increment a panel's click count in Supabase.
   * Uses a server-side RPC so the increment is atomic.
   */
  const incrementPanelClick = useCallback(async (panelId: string) => {
    if (!userId) return
    await supabase.rpc('increment_panel_click', {
      p_user_id: userId,
      p_panel_id: panelId,
    })
  }, [userId])

  /** Call on mouseenter — fires only if hover lasts >1.5s (genuine attention) */
  const trackHover = useCallback((panelId: string) => {
    hoverTimers.current[panelId] = setTimeout(() => {
      track({ event_type: 'panel_hover', panel_id: panelId })
    }, 1500)
  }, [track])

  const cancelHover = useCallback((panelId: string) => {
    clearTimeout(hoverTimers.current[panelId])
  }, [])

  return { track, trackHover, cancelHover, incrementPanelClick }
}