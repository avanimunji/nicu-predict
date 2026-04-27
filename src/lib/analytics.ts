/**
 * analytics.ts
 * Captures mouse movement heatmap data and panel interaction sequences.
 * Writes to Supabase in batched debounced intervals to avoid flooding.
 */

import { supabase } from './supabase'

interface MouseSample { x: number; y: number; t: number }
interface PanelEvent  { panel_id: string; event_type: string; ts: number }

let mouseSamples: MouseSample[]  = []
let panelEvents:  PanelEvent[]   = []
let flushTimer:   ReturnType<typeof setTimeout> | null = null
let userId:       string | null  = null
let sessionId:    string         = crypto.randomUUID()

// ── Bootstrap: call once on dashboard mount ──────────────────────────────────
export function initAnalytics(uid: string) {
  userId    = uid
  sessionId = crypto.randomUUID()

  // Sample mouse position at most every 200ms to stay lightweight
  let lastSample = 0
  window.addEventListener('mousemove', (e) => {
    const now = Date.now()
    if (now - lastSample < 200) return
    lastSample = now
    mouseSamples.push({ x: Math.round(e.clientX), y: Math.round(e.clientY), t: now })
    scheduleFlush()
  })
}

export function teardownAnalytics() {
  flushNow()
}

// ── Public: call from useTracking ────────────────────────────────────────────
export function recordPanelEvent(panelId: string, eventType: string) {
  panelEvents.push({ panel_id: panelId, event_type: eventType, ts: Date.now() })
  scheduleFlush()
}

// ── Flush logic ──────────────────────────────────────────────────────────────
function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(flushNow, 5000) // batch every 5s
}

async function flushNow() {
  flushTimer = null
  if (!userId) return

  const mouseBatch  = mouseSamples.splice(0)
  const panelBatch  = panelEvents.splice(0)

  const inserts = []

if (mouseBatch.length > 0) {
  inserts.push(
    supabase.from('mouse_samples').insert({
      user_id: userId,
      session_id: sessionId,
      samples: mouseBatch,
      created_at: new Date().toISOString(),
    })
  )
}

if (panelBatch.length > 0) {
  inserts.push(
    supabase.from('user_events').insert(
      panelBatch.map(e => ({
        user_id: userId,
        session_id: sessionId,
        panel_id: e.panel_id,
        event_type: e.event_type,
        created_at: new Date(e.ts).toISOString(),
      }))
    )
  )
}

await Promise.allSettled(inserts)
}