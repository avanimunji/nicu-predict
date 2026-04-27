/**
 * LoginPage.tsx
 * Email + password auth via Supabase.
 * On success, App.tsx's onAuthStateChange fires → sets userId in store → redirects to /dashboard.
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../store/userStore'
import { Heart } from 'lucide-react'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const navigate   = useNavigate()
  const userId     = useUserStore(s => s.userId)
  const [mode, setMode]       = useState<Mode>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  // Already logged in → skip login screen
  useEffect(() => {
    if (userId) navigate('/dashboard', { replace: true })
  }, [userId, navigate])

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // After signup, switch to login so they can confirm + sign in
        setMode('login')
        setError('Account created — check your email to confirm, then sign in.')
        setLoading(false)
        return
      }
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 text-sm font-medium">
          <Heart size={14} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] tracking-wide">NICU-Predict</p>
            <p className="text-[9px] text-[var(--color-text-faint)] uppercase tracking-widest">CDSS Study Interface v3.0</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-white/[0.07] rounded-2xl p-8">
          <h1 className="text-lg font-light text-[var(--color-text-primary)] mb-1">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-[11px] text-[var(--color-text-muted)] mb-7">
            {mode === 'login'
              ? 'Enter your credentials to access the dashboard.'
              : 'Register for study access. Account requires approval.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label-micro block mb-2">Email</label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                required
                autoComplete="email"
                className="
                  w-full bg-white/[0.03] border border-[var(--color-border-strong)] rounded-xl
                  px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-border)] focus:bg-white/[0.05]
                  transition-all duration-150 font-mono
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="label-micro block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="
                  w-full bg-white/[0.03] border border-[var(--color-border-strong)] rounded-xl
                  px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-border)] focus:bg-white/[0.05]
                  transition-all duration-150 font-mono
                "
              />
            </div>

            {/* Error / info message */}
            {error && (
              <div className={`
                rounded-xl px-4 py-3 text-[11px] leading-relaxed
                ${error.startsWith('Account created')
                  ? 'bg-green-500/8 border border-green-500/20 text-green-400'
                  : 'bg-red-500/8 border border-red-500/20 text-red-400'}
              `}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="
               w-full bg-[var(--color-surface)] hover:bg-[var(--color-fill-muted)] disabled:opacity-40
               border border-[var(--color-border)] hover:border-[var(--color-border-strong)]
               text-[var(--color-text-primary)] text-sm rounded-xl py-3
               transition-all duration-150 active:scale-[0.99]
               disabled:cursor-not-allowed
              "
            >
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Mode toggle */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
              className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] transition-colors underline underline-offset-2"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[9px] text-[var(--color-text-faint)] leading-relaxed">
          Access restricted to authorised study personnel.<br />
          All interactions are logged for research purposes.
        </p>
      </div>
    </div>
  )
}