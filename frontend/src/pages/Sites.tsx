import { useCallback, useEffect, useState } from 'react'
import { api, fieldErrors } from '../api/client'
import type { Plot, Site } from '../api/types'
import { EmptyState, FieldError, Spinner, StatusBadge } from '../components/ui'
import { useToast } from '../components/Toast'

const mapColors: Record<Plot['status'], { bg: string; text: string }> = {
  available: { bg: 'var(--color-seq-250)', text: '#0b0b0b' },
  reserved: { bg: 'var(--color-seq-450)', text: '#ffffff' },
  occupied: { bg: 'var(--color-seq-650)', text: '#ffffff' },
}

function PlotMap({ plots, selected, onSelect }: { plots: Plot[]; selected: Plot | null; onSelect: (p: Plot) => void }) {
  const sections = [...new Set(plots.map((p) => p.section ?? 'Unsectioned'))]

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section}>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">Section {section}</p>
          <div className="flex flex-wrap gap-1.5">
            {plots
              .filter((p) => (p.section ?? 'Unsectioned') === section)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  title={`${p.code} — ${p.status}`}
                  className={`flex h-10 w-14 items-center justify-center rounded text-[11px] font-medium transition-transform hover:scale-105 ${
                    selected?.id === p.id ? 'ring-2 ring-ink ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: mapColors[p.status].bg, color: mapColors[p.status].text }}
                >
                  {p.code}
                </button>
              ))}
          </div>
        </div>
      ))}
      <div className="flex gap-5 border-t border-hairline pt-3 text-xs text-ink-secondary">
        {(['available', 'reserved', 'occupied'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 capitalize">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: mapColors[s].bg }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[] | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [activeSite, setActiveSite] = useState<number | null>(null)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [newSiteName, setNewSiteName] = useState('')
  const [newPlot, setNewPlot] = useState({ code: '', type: 'grave' as Plot['type'], section: '' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const toast = useToast()

  const loadSites = useCallback(async () => {
    const s = await api.get('/sites')
    setSites(s.data)
    setActiveSite((current) => current ?? s.data[0]?.id ?? null)
  }, [])

  const loadPlots = useCallback(async (siteId: number) => {
    const p = await api.get('/plots', { params: { site_id: siteId } })
    setPlots(p.data)
  }, [])

  useEffect(() => {
    loadSites()
  }, [loadSites])

  useEffect(() => {
    if (activeSite) {
      setSelectedPlot(null)
      loadPlots(activeSite)
    }
  }, [activeSite, loadPlots])

  async function addSite() {
    try {
      await api.post('/sites', { name: newSiteName })
      setNewSiteName('')
      toast('Site added')
      loadSites()
    } catch (err) {
      toast('Could not add site', 'error')
      setErrors(fieldErrors(err))
    }
  }

  async function addPlot() {
    if (!activeSite) return
    setErrors({})
    try {
      await api.post('/plots', { site_id: activeSite, ...newPlot, section: newPlot.section || null })
      setNewPlot({ code: '', type: 'grave', section: '' })
      toast('Plot added')
      loadPlots(activeSite)
    } catch (err) {
      setErrors(fieldErrors(err))
      toast('Could not add plot', 'error')
    }
  }

  if (!sites) return <Spinner />

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Sites & Plots</h1>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="panel h-fit">
          <h2 className="mb-3 text-sm font-semibold">Sites</h2>
          {sites.length === 0 ? (
            <EmptyState title="No sites yet" hint="Add your first cemetery or crematorium below." />
          ) : (
            <ul className="mb-4 space-y-1">
              {sites.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSite(s.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      s.id === activeSite ? 'bg-brand-50 font-medium text-brand-800' : 'hover:bg-page'
                    }`}
                  >
                    {s.name}
                    <span className="ml-1 text-xs text-ink-muted">({s.plots_count})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 border-t border-hairline pt-3">
            <input className="field" placeholder="New site name" value={newSiteName} onChange={(e) => setNewSiteName(e.target.value)} />
            <FieldError errors={errors} name="name" />
            <button className="btn w-full" onClick={addSite} disabled={!newSiteName.trim()}>
              Add site
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel">
            <h2 className="mb-4 text-sm font-semibold">Plot map</h2>
            {plots.length === 0 ? (
              <EmptyState title="No plots at this site yet" hint="Add plots below and they will appear on the map." />
            ) : (
              <PlotMap plots={plots} selected={selectedPlot} onSelect={setSelectedPlot} />
            )}
          </div>

          {selectedPlot && (
            <div className="panel">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold">Plot {selectedPlot.code}</h3>
                  <p className="mt-0.5 text-sm capitalize text-ink-muted">
                    {selectedPlot.type} · Section {selectedPlot.section ?? '—'} · capacity {selectedPlot.capacity}
                  </p>
                </div>
                <StatusBadge status={selectedPlot.status} />
              </div>
            </div>
          )}

          <div className="panel">
            <h2 className="mb-3 text-sm font-semibold">Add plot</h2>
            <div className="flex flex-wrap items-start gap-2">
              <div>
                <input className="field w-36" placeholder="Code (e.g. B-203)" value={newPlot.code} onChange={(e) => setNewPlot({ ...newPlot, code: e.target.value })} />
                <FieldError errors={errors} name="code" />
              </div>
              <select className="field w-36" value={newPlot.type} onChange={(e) => setNewPlot({ ...newPlot, type: e.target.value as Plot['type'] })}>
                <option value="grave">Grave</option>
                <option value="niche">Niche</option>
                <option value="mausoleum">Mausoleum</option>
                <option value="plot">Plot</option>
              </select>
              <input className="field w-32" placeholder="Section" value={newPlot.section} onChange={(e) => setNewPlot({ ...newPlot, section: e.target.value })} />
              <button className="btn" onClick={addPlot} disabled={!newPlot.code.trim()}>
                Add plot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
