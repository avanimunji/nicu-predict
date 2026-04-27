import { supabase } from '../../lib/supabase'
import { useUserStore } from '../../store/userStore'
import { usePatientStore } from '../../store/patientStore'
import { LogOut } from 'lucide-react'
import { Heart } from 'lucide-react'

// ─── Risk styling (UNCHANGED LOGIC) ──────────────────────────────────────────

function riskColor(score: number) {
  if (score >= 0.65) return 'var(--color-red)'
  if (score >= 0.4) return 'var(--color-amber)'
  return 'var(--color-green)'
}

function riskDot(score: number) {
  if (score >= 0.65) return 'var(--color-red)'
  if (score >= 0.4) return 'var(--color-amber)'
  return 'var(--color-green)'
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SidebarProps {
  onPatientSelect?: (id: string) => void
}

export function Sidebar({ onPatientSelect }: SidebarProps) {
  const { email, clearUser } = useUserStore()
  const { patients, selectedId, selectPatient } = usePatientStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearUser()
  }

  return (
    <aside
      className="w-[260px] h-full flex flex-col flex-shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-fill-subtle)',
      }}
    >

      {/* ─── Brand ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--color-fill-subtle)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              background: 'var(--color-fill-muted)',
              border: '1px solid var(--color-fill-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            <Heart size={14} strokeWidth={1.8} />
          </div>

          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            NICU-Predict
          </span>
        </div>

        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          CDSS Study Interface v3.0
        </p>
      </div>

      {/* ─── Patients ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4">

        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            padding: '0 8px',
            marginBottom: 12,
          }}
        >
          Patient cohort
        </p>

        <div className="space-y-1">
          {patients.map(p => {
            const selected = selectedId === p.id

            return (
              <button
                key={p.id}
                onClick={() => {
                  selectPatient(p.id)
                  onPatientSelect?.(p.id)
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between"
                style={{
                  background: selected
                    ? 'var(--color-fill-muted)'
                    : 'transparent',
                  border: selected
                    ? '1px solid var(--color-fill-subtle)'
                    : '1px solid transparent',
                }}
              >
                {/* Left */}
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {p.id}
                  </p>

                  <p
                    style={{
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {p.diagnosisShort}
                  </p>
                </div>

                {/* Risk */}
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: riskDot(p.riskScore),
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: riskColor(p.riskScore),
                    }}
                  >
                    {Math.round(p.riskScore * 100)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <div
        style={{
          padding: 16,
          borderTop: '1px solid var(--color-fill-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: 'var(--color-text-muted)',
            marginBottom: 10,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </p>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            color: 'var(--color-text-muted)',
          }}
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  )
}