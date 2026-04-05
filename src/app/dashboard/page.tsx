'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import LeadsList from '../../components/LeadsList'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Se încarcă...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', color: '#E8ECF4', padding: '24px 32px' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #63B6FF, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
          }}>
            C
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>CRM SaaS</h1>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
              {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#94A3B8',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Deconectare
        </button>
      </div>

      {/* Leads List */}
      <LeadsList />
    </div>
  )
}