import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Deceased, Family, Plot } from '../api/types'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/calendar', label: 'Calendar', icon: '▤' },
  { to: '/sites', label: 'Sites & Plots', icon: '⚑' },
  { to: '/deceased', label: 'Interments', icon: '✦' },
  { to: '/families', label: 'Families', icon: '☗' },
  { to: '/reservations', label: 'Reservations', icon: '◫' },
  { to: '/payments', label: 'Payments', icon: '◈' },
]

interface SearchResults {
  families: Family[]
  plots: Plot[]
  deceased: Deceased[]
}

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      return
    }
    const t = setTimeout(async () => {
      const [families, plots, deceased] = await Promise.all([
        api.get('/families', { params: { search: query } }),
        api.get('/plots'),
        api.get('/deceased', { params: { search: query } }),
      ])
      const q = query.toLowerCase()
      setResults({
        families: families.data.slice(0, 4),
        plots: plots.data.filter((p: Plot) => p.code.toLowerCase().includes(q)).slice(0, 4),
        deceased: deceased.data.slice(0, 4),
      })
      setOpen(true)
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(path: string) {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  const hasResults =
    results && (results.families.length > 0 || results.plots.length > 0 || results.deceased.length > 0)

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <input
        className="field"
        placeholder="Search families, plots, names…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
      />
      {open && results && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-hairline bg-surface shadow-lg">
          {!hasResults && <p className="px-3 py-2.5 text-sm text-ink-muted">No matches for “{query}”</p>}
          {results.families.map((f) => (
            <button key={`f${f.id}`} className="block w-full px-3 py-2 text-left text-sm hover:bg-page" onClick={() => go('/families')}>
              <span className="text-ink-muted">Family · </span>
              {f.name}
            </button>
          ))}
          {results.plots.map((p) => (
            <button key={`p${p.id}`} className="block w-full px-3 py-2 text-left text-sm hover:bg-page" onClick={() => go('/sites')}>
              <span className="text-ink-muted">Plot · </span>
              {p.code}
            </button>
          ))}
          {results.deceased.map((d) => (
            <button key={`d${d.id}`} className="block w-full px-3 py-2 text-left text-sm hover:bg-page" onClick={() => go('/deceased')}>
              <span className="text-ink-muted">Interment · </span>
              {d.first_name} {d.last_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-56 flex-col border-r border-hairline bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-base text-white">✦</span>
          <div>
            <p className="text-sm font-semibold leading-tight">Everhaven</p>
            <p className="text-[11px] leading-tight text-ink-muted">Cemetery Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-brand-50 font-medium text-brand-800' : 'text-ink-secondary hover:bg-page'
                }`
              }
            >
              <span aria-hidden className="w-4 text-center text-ink-muted">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-hairline px-5 py-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs capitalize text-ink-muted">{user?.role}</p>
          <button className="mt-2 text-xs text-ink-secondary underline-offset-2 hover:underline" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="ml-56 flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline bg-surface/90 px-6 py-3 backdrop-blur">
          <GlobalSearch />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
