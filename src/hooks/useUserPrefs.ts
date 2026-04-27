/**
 * useUserPrefs.ts
 * On mount, fetches this user's panel click counts from Supabase
 * and populates the Zustand store. Any panel that has been expanded
 * >= AUTO_EXPAND_THRESHOLD times will be in panelPrefs.autoExpand,
 * causing it to render open on the next login.
 */

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'

const AUTO_EXPAND_THRESHOLD = 5

export function useUserPrefs() {
  const { userId, setPanelPrefs } = useUserStore()

  useEffect(() => {
    if (!userId) return

    async function load() {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('panel_click_counts')
        .eq('user_id', userId)
        .single()

      if (error || !data) return

      const counts = (data.panel_click_counts ?? {}) as Record<string, number>

      const autoExpand = Object.entries(counts)
        .filter(([, count]) => count >= AUTO_EXPAND_THRESHOLD)
        .map(([panelId]) => panelId)

      setPanelPrefs({ autoExpand, clickCounts: counts })
    }

    load()
  }, [userId, setPanelPrefs])
}