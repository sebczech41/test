import { useCallback, useEffect, useState } from 'react'
import { api, fieldErrors } from '../api/client'
import type { Deceased, Family, Plot } from '../api/types'
import { EmptyState, FieldError, Spinner, StatusBadge } from '../components/ui'
import { useToast } from '../components/Toast'

const emptyForm = {
  plot_id: '',
  family_id: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  date_of_death: '',
  interment_date: '',
  interment_type: 'burial' as Deceased['interment_type'],
  notes: '',
}

export default function DeceasedPage() {
  const [records, setRecords] = useState<Deceased[] | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showForm, setShowForm] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    const [d, p, f] = await Promise.all([api.get('/deceased'), api.get('/plots'), api.get('/families')])
    setRecords(d.data)
    setPlots(p.data)
    setFamilies(f.data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save() {
    setErrors({})
    try {
      await api.post('/deceased', {
        ...form,
        plot_id: Number(form.plot_id),
        family_id: form.family_id ? Number(form.family_id) : null,
        date_of_birth: form.date_of_birth || null,
        date_of_death: form.date_of_death || null,
        interment_date: form.interment_date || null,
        notes: form.notes || null,
      })
      setForm(emptyForm)
      setShowForm(false)
      toast('Interment record added')
      load()
    } catch (err) {
      setErrors(fieldErrors(err))
      toast('Could not save record', 'error')
    }
  }

  if (!records) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Interments</h1>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : '+ New record'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <h2 className="mb-3 text-sm font-semibold">New interment record</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="field-label">First name</label>
              <input className="field" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              <FieldError errors={errors} name="first_name" />
            </div>
            <div>
              <label className="field-label">Last name</label>
              <input className="field" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              <FieldError errors={errors} name="last_name" />
            </div>
            <div>
              <label className="field-label">Plot</label>
              <select className="field" value={form.plot_id} onChange={(e) => setForm({ ...form, plot_id: e.target.value })}>
                <option value="">Select plot…</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.site?.name} — {p.code}
                  </option>
                ))}
              </select>
              <FieldError errors={errors} name="plot_id" />
            </div>
            <div>
              <label className="field-label">Family (optional)</label>
              <select className="field" value={form.family_id} onChange={(e) => setForm({ ...form, family_id: e.target.value })}>
                <option value="">—</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Date of birth</label>
              <input type="date" className="field" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Date of death</label>
              <input type="date" className="field" value={form.date_of_death} onChange={(e) => setForm({ ...form, date_of_death: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Interment date</label>
              <input type="date" className="field" value={form.interment_date} onChange={(e) => setForm({ ...form, interment_date: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select className="field" value={form.interment_type} onChange={(e) => setForm({ ...form, interment_type: e.target.value as Deceased['interment_type'] })}>
                <option value="burial">Burial</option>
                <option value="cremation">Cremation</option>
              </select>
            </div>
          </div>
          <button className="btn mt-4" onClick={save} disabled={!form.first_name || !form.last_name || !form.plot_id}>
            Save record
          </button>
        </div>
      )}

      <div className="panel">
        {records.length === 0 ? (
          <EmptyState title="No interment records yet" hint="Create your first record to link a person to their resting place." />
        ) : (
          <table className="table-base">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Plot</th>
                <th className="pb-2 pr-4 font-medium">Site</th>
                <th className="pb-2 pr-4 font-medium">Born</th>
                <th className="pb-2 pr-4 font-medium">Died</th>
                <th className="pb-2 pr-4 font-medium">Interred</th>
                <th className="pb-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {records.map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5 pr-4 font-medium">
                    {d.last_name}, {d.first_name}
                  </td>
                  <td className="py-2.5 pr-4">{d.plot?.code}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{d.plot?.site?.name}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{d.date_of_birth?.slice(0, 10) ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{d.date_of_death?.slice(0, 10) ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{d.interment_date?.slice(0, 10) ?? '—'}</td>
                  <td className="py-2.5">
                    <StatusBadge status={d.interment_type} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
