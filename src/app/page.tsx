'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) {
      if (authError.message.includes('Invalid login')) {
        setError('Email sau parolă incorectă.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Confirmă-ți email-ul înainte de a te autentifica.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    if (!fullName.trim()) {
      setError('Introdu numele complet.')
      setLoading(false)
      return
    }
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Acest email este deja înregistrat.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }
    setSuccess('Cont creat! Verifică-ți email-ul pentru confirmare.')
    setLoading(false)
  }

  async function handleForgotPassword() {
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: window.location.origin + '/reset-password' }
    )
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    setSuccess('Link de resetare trimis! Verifică-ți email-ul.')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Introdu adresa de email.'); return }
    if (mode !== 'forgot' && password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.')
      return
    }
    if (mode === 'login') await handleLogin()
    else if (mode === 'register') await handleRegister()
    else await handleForgotPassword()
  }

  function switchMode(newMode: 'login' | 'register' | 'forgot') {
    setMode(newMode)
    setError('')
    setSuccess('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-10 shadow-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              C
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              CRM SaaS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' && 'Bine ai revenit'}
            {mode === 'register' && 'Creează cont'}
            {mode === 'forgot' && 'Resetare parolă'}
          </h1>
          <p className="text-sm text-slate-400">
            {mode === 'login' && 'Autentifică-te pentru a accesa CRM-ul'}
            {mode === 'register' && 'Completează datele pentru cont nou'}
            {mode === 'forgot' && 'Introdu email-ul pentru link de resetare'}
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Nume complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexandra Nitu"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alexandra@clinicadriosif.ro"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Parolă
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Am uitat parola
              </button>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              ✓ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            {loading
              ? 'Se procesează...'
              : mode === 'login'
              ? 'Autentificare'
              : mode === 'register'
              ? 'Creează cont'
              : 'Trimite link de resetare'}
          </button>
        </form>

        {/* Navigare între moduri */}
        <div className="text-center mt-6 pt-5 border-t border-white/5">
          {mode === 'login' && (
            <p className="text-sm text-slate-400">
              Nu ai cont?{' '}
              <button
                onClick={() => switchMode('register')}
                className="text-blue-400 font-semibold hover:text-blue-300"
              >
                Înregistrează-te
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p className="text-sm text-slate-400">
              Ai deja cont?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-blue-400 font-semibold hover:text-blue-300"
              >
                Autentifică-te
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p className="text-sm text-slate-400">
              Înapoi la{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-blue-400 font-semibold hover:text-blue-300"
              >
                autentificare
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-5">
          Ad Marketing Agency SRL · Powered by Supabase
        </p>
      </div>
    </div>
  )
}