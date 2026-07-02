import { useCallback, useEffect, useState } from 'react'
import { api, fieldErrors } from '../api/client'
import type { Family } from '../api/types'
import { EmptyState, FieldError, Spinner } from '../components/ui'
import { useToast } from '../components/Toast'

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[] | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const toast = useToast()

  const load = useCallback(async () => {
    const { data } = await api.get('/families')
    setFamilies(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addFamily() {
    setErrors({})
    try {
      await api.post('/families', {
        ...form,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
      })
      setForm({ name: '', email: '', phone: '', address: '' })
      toast('Family added')
      load()
    } catch (err) {
      setErrors(fieldErrors(err))
      toast('Could not add family', 'error')
    }
  }

  if (!families) return <Spinner />

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Families</h1>

      <div className="panel">
        {families.length === 0 ? (
          <EmptyState title="No families yet" hint="Add the first family record below." />
        ) : (
          <table className="table-base">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Phone</th>
                <th className="pb-2 font-medium">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {families.map((f) => (
                <tr key={f.id}>
                  <td className="py-2.5 pr-4 font-medium">{f.name}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{f.email ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{f.phone ?? '—'}</td>
                  <td className="py-2.5 text-ink-secondary">{f.address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="mb-3 text-sm font-semibold">Add family</h2>
        <div className="flex flex-wrap items-start gap-2">
          <div>
            <input className="field w-44" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FieldError errors={errors} name="name" />
          </div>
          <div>
            <input className="field w-52" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FieldError errors={errors} name="email" />
          </div>
          <input className="field w-36" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="field w-56" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="btn" onClick={addFamily} disabled={!form.name.trim()}>
            Add family
          </button>
        </div>
      </div>
    </div>
  )
}
