import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { LoginPage } from './pages/LoginPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { useUserStore } from './store/userStore.ts'
import { supabase } from './lib/supabase.ts'

export default function App() {
  const { setUser, clearUser } = useUserStore()

  // Persist auth state across page refreshes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user.id, session.user.email ?? '')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user.id, session.user.email ?? '')
      else clearUser()
    })
    return () => subscription.unsubscribe()
  }, [setUser, clearUser])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = useUserStore(s => s.userId)
  if (!userId) return <Navigate to="/login" replace />
  return <>{children}</>
}