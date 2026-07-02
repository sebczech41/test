import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <form className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-8 shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">✦</span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Everhaven</h1>
            <p className="text-xs text-ink-muted">Cemetery Management</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-status-critical">{error}</p>}
        <button type="submit" className="btn mt-5 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
