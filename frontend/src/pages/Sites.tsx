import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Plot, Site } from '../api/types'

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [activeSite, setActiveSite] = useState<number | null>(null)
  const [newSiteName, setNewSiteName] = useState('')
  const [newPlot, setNewPlot] = useState({ code: '', type: 'grave' as Plot['type'], section: '' })

  async function load() {
    const s = await api.get('/sites')
    setSites(s.data)
    if (s.data.length && activeSite === null) setActiveSite(s.data[0].id)
  }

  async function loadPlots(siteId: number) {
    const p = await api.get('/plots', { params: { site_id: siteId } })
    setPlots(p.data)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (activeSite) loadPlots(activeSite)
  }, [activeSite])

  async function addSite() {
    if (!newSiteName.trim()) return
    await api.post('/sites', { name: newSiteName })
    setNewSiteName('')
    load()
  }

  async function addPlot() {
    if (!activeSite || !newPlot.code.trim()) return
    await api.post('/plots', { site_id: activeSite, ...newPlot })
    setNewPlot({ code: '', type: 'grave', section: '' })
    loadPlots(activeSite)
  }

  return (
    <div className="two-column">
      <div className="panel">
        <h2>Sites</h2>
        <ul className="list">
          {sites.map((s) => (
            <li key={s.id} className={s.id === activeSite ? 'active' : ''} onClick={() => setActiveSite(s.id)}>
              {s.name} <span className="muted">({s.plots_count} plots)</span>
            </li>
          ))}
        </ul>
        <div className="inline-form">
          <input placeholder="New site name" value={newSiteName} onChange={(e) => setNewSiteName(e.target.value)} />
          <button onClick={addSite}>Add site</button>
        </div>
      </div>

      <div className="panel">
        <h2>Plots / Graves</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Section</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {plots.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.type}</td>
                <td>{p.section}</td>
                <td>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="inline-form">
          <input
            placeholder="Code (e.g. B-203)"
            value={newPlot.code}
            onChange={(e) => setNewPlot({ ...newPlot, code: e.target.value })}
          />
          <select value={newPlot.type} onChange={(e) => setNewPlot({ ...newPlot, type: e.target.value as Plot['type'] })}>
            <option value="grave">Grave</option>
            <option value="niche">Niche</option>
            <option value="mausoleum">Mausoleum</option>
            <option value="plot">Plot</option>
          </select>
          <input
            placeholder="Section"
            value={newPlot.section}
            onChange={(e) => setNewPlot({ ...newPlot, section: e.target.value })}
          />
          <button onClick={addPlot}>Add plot</button>
        </div>
      </div>
    </div>
  )
}
