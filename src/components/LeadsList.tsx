'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Lead = {
  id: string
  full_name: string
  phone: string
  email: string
  location: string
  treatment: string
  source: string
  campaign: string
  funnel_1_status: string
  funnel_2_status: string
  funnel_3_status: string
  spent: number
  lead_added_at: string
  assigned_to: string
}

// Culorile pentru statusuri
function statusColor(status: string | null) {
  if (!status) return { bg: '#1E293B', text: '#64748B' }
  const s = status.toLowerCase()
  if (s === 'programat' || s === 'prezentat' || s === 'tratament început')
    return { bg: 'rgba(52,211,153,0.1)', text: '#34D399' }
  if (s === 'de revenit' || s === 'nu acum' || s === 'in asteptare' || s === 'reprogramat' || s.includes('nu răspunde'))
    return { bg: 'rgba(251,191,36,0.1)', text: '#FBBF24' }
  if (s === 'nu este interesat' || s === 'anulat' || s === 'telefon deconectat' || s === 'nr gresit' || s === 'anulat/neprezentat' || s === 'fără tratament')
    return { bg: 'rgba(248,113,113,0.1)', text: '#F87171' }
  if (s === 'pacient vechi')
    return { bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6' }
  return { bg: '#1E293B', text: '#94A3B8' }
}

function StatusBadge({ status }: { status: string | null }) {
  const colors = statusColor(status)
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      background: colors.bg,
      color: colors.text,
      whiteSpace: 'nowrap',
    }}>
      {status || '—'}
    </span>
  )
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFunnel, setFilterFunnel] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [page, setPage] = useState(0)
  const perPage = 25

  // Încarcă leadurile din Supabase
  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('lead_added_at', { ascending: false })

      if (error) {
        console.error('Eroare la încărcare leads:', error)
        setLoading(false)
        return
      }
      setLeads(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    fetchLeads()
  }, [])

  // Filtrare și căutare
  useEffect(() => {
    let result = [...leads]

    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.full_name?.toLowerCase().includes(s) ||
          l.phone?.toLowerCase().includes(s) ||
          l.email?.toLowerCase().includes(s) ||
          l.location?.toLowerCase().includes(s)
      )
    }

    if (filterFunnel !== 'all') {
      result = result.filter((l) => l.funnel_1_status === filterFunnel)
    }

    if (filterSource !== 'all') {
      result = result.filter((l) => l.source === filterSource)
    }

    setFiltered(result)
    setPage(0)
  }, [search, filterFunnel, filterSource, leads])

  // Sursele unice pentru dropdown
  const uniqueSources = [...new Set(leads.map((l) => l.source).filter(Boolean))].sort()
  const uniqueStatuses = [...new Set(leads.map((l) => l.funnel_1_status).filter(Boolean))].sort()

  // Paginare
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice(page * perPage, (page + 1) * perPage)

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
        Se încarcă leadurile...
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#E8ECF4', margin: 0 }}>
            Leads
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
            {filtered.length} din {leads.length} leaduri
          </p>
        </div>
      </div>

      {/* Bara de căutare + filtre */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Caută după nume, telefon, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 14px',
            fontSize: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            color: '#E8ECF4',
            outline: 'none',
          }}
        />
        <select
          value={filterFunnel}
          onChange={(e) => setFilterFunnel(e.target.value)}
          style={{
            padding: '10px 14px',
            fontSize: 13,
            background: '#0F1423',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            color: '#94A3B8',
            outline: 'none',
          }}
        >
          <option value="all">Toate statusurile F1</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          style={{
            padding: '10px 14px',
            fontSize: 13,
            background: '#0F1423',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            color: '#94A3B8',
            outline: 'none',
          }}
        >
          <option value="all">Toate sursele</option>
          {uniqueSources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Nume', 'Telefon', 'Sursă', 'Funnel 1', 'Funnel 2', 'Funnel 3', 'Plătit', 'Data'].map((h) => (
                <th key={h} style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  color: '#64748B',
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px', color: '#E8ECF4', fontWeight: 500 }}>
                  {lead.full_name || '—'}
                </td>
                <td style={{ padding: '12px 16px', color: '#94A3B8' }}>
                  {lead.phone || '—'}
                </td>
                <td style={{ padding: '12px 16px', color: '#94A3B8', textTransform: 'capitalize' }}>
                  {lead.source || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={lead.funnel_1_status} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={lead.funnel_2_status} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={lead.funnel_3_status} />
                </td>
                <td style={{ padding: '12px 16px', color: lead.spent ? '#34D399' : '#64748B' }}>
                  {lead.spent ? `${lead.spent} RON` : '—'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                  {lead.lead_added_at
                    ? new Date(lead.lead_added_at).toLocaleDateString('ro-RO')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginare */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: page === 0 ? '#334155' : '#94A3B8',
              cursor: page === 0 ? 'default' : 'pointer',
              fontSize: 13,
            }}
          >
            ← Înapoi
          </button>
          <span style={{ color: '#64748B', fontSize: 13 }}>
            Pagina {page + 1} din {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: page >= totalPages - 1 ? '#334155' : '#94A3B8',
              cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              fontSize: 13,
            }}
          >
            Înainte →
          </button>
        </div>
      )}

      {/* Drawer — detalii lead */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 480,
            background: '#0B0F1A',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            zIndex: 50,
            overflowY: 'auto',
            padding: 32,
          }}
        >
          {/* Overlay */}
          <div
            onClick={() => setSelectedLead(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 480,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 49,
            }}
          />

          <div style={{ position: 'relative', zIndex: 51 }}>
            {/* Close button */}
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: 24,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Numele lead-ului */}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#E8ECF4', margin: '0 0 4px' }}>
              {selectedLead.full_name || 'Fără nume'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Adăugat: {selectedLead.lead_added_at ? new Date(selectedLead.lead_added_at).toLocaleDateString('ro-RO') : '—'}
            </p>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Telefon', value: selectedLead.phone },
                { label: 'Email', value: selectedLead.email },
                { label: 'Locație', value: selectedLead.location },
                { label: 'Sursă', value: selectedLead.source },
                { label: 'Campanie', value: selectedLead.campaign },
                { label: 'Tratament', value: selectedLead.treatment },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 14, color: '#E8ECF4', margin: 0, wordBreak: 'break-all' }}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Funnel status */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8', marginBottom: 12 }}>
              Status Funnel
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Funnel 1', status: selectedLead.funnel_1_status },
                { label: 'Funnel 2', status: selectedLead.funnel_2_status },
                { label: 'Funnel 3', status: selectedLead.funnel_3_status },
              ].map((f) => (
                <div key={f.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>{f.label}</span>
                  <StatusBadge status={f.status} />
                </div>
              ))}
            </div>

            {/* Revenue */}
            <div style={{
              padding: '16px',
              background: selectedLead.spent ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)',
              borderRadius: 10,
              border: `1px solid ${selectedLead.spent ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)'}`,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', textTransform: 'uppercase' }}>
                Suma plătită
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: selectedLead.spent ? '#34D399' : '#334155', margin: 0 }}>
                {selectedLead.spent ? `${selectedLead.spent} RON` : '0 RON'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}