import { useCallback, useEffect, useState } from 'react'
import { api, fieldErrors } from '../api/client'
import type { Family, Plot, Reservation } from '../api/types'
import { EmptyState, FieldError, Spinner, StatusBadge } from '../components/ui'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [form, setForm] = useState({
    plot_id: '',
    family_id: '',
    start_date: '',
    billing_cycle: 'yearly' as Reservation['billing_cycle'],
    fee_amount: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const toast = useToast()
  const confirm = useConfirm()

  const load = useCallback(async () => {
    const [r, p, f] = await Promise.all([
      api.get('/reservations'),
      api.get('/plots', { params: { status: 'available' } }),
      api.get('/families'),
    ])
    setReservations(r.data)
    setPlots(p.data)
    setFamilies(f.data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addReservation() {
    setErrors({})
    try {
      await api.post('/reservations', {
        plot_id: Number(form.plot_id),
        family_id: Number(form.family_id),
        start_date: form.start_date,
        billing_cycle: form.billing_cycle,
        fee_amount: Number(form.fee_amount),
      })
      setForm({ plot_id: '', family_id: '', start_date: '', billing_cycle: 'yearly', fee_amount: '' })
      toast('Reservation created')
      load()
    } catch (err) {
      setErrors(fieldErrors(err))
      toast('Could not create reservation', 'error')
    }
  }

  async function cancelReservation(r: Reservation) {
    const ok = await confirm({
      title: 'Cancel this reservation?',
      message: `Plot ${r.plot?.code} will become available again and future fees will stop for ${r.family?.name}.`,
      confirmLabel: 'Cancel reservation',
      danger: true,
    })
    if (!ok) return
    await api.put(`/reservations/${r.id}`, { status: 'cancelled' })
    toast('Reservation cancelled')
    load()
  }

  if (!reservations) return <Spinner />

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reservations & fees</h1>

      <div className="panel">
        {reservations.length === 0 ? (
          <EmptyState title="No reservations yet" hint="Reserve a plot for a family below to start billing." />
        ) : (
          <table className="table-base">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="pb-2 pr-4 font-medium">Plot</th>
                <th className="pb-2 pr-4 font-medium">Family</th>
                <th className="pb-2 pr-4 font-medium">Start</th>
                <th className="pb-2 pr-4 font-medium">Billing</th>
                <th className="pb-2 pr-4 font-medium">Fee</th>
                <th className="pb-2 pr-4 font-medium">Next due</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-4 font-medium">{r.plot?.code}</td>
                  <td className="py-2.5 pr-4">{r.family?.name}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{r.start_date.slice(0, 10)}</td>
                  <td className="py-2.5 pr-4 capitalize text-ink-secondary">{r.billing_cycle}</td>
                  <td className="py-2.5 pr-4">${r.fee_amount}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{r.next_due_date?.slice(0, 10) ?? '—'}</td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2.5 text-right">
                    {r.status === 'active' && (
                      <button className="btn-secondary !px-2.5 !py-1 text-xs" onClick={() => cancelReservation(r)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2 className="mb-3 text-sm font-semibold">New reservation</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="field-label">Available plot</label>
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
            <label className="field-label">Family</label>
            <select className="field" value={form.family_id} onChange={(e) => setForm({ ...form, family_id: e.target.value })}>
              <option value="">Select family…</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <FieldError errors={errors} name="family_id" />
          </div>
          <div>
            <label className="field-label">Start date</label>
            <input type="date" className="field" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <FieldError errors={errors} name="start_date" />
          </div>
          <div>
            <label className="field-label">Billing cycle</label>
            <select
              className="field"
              value={form.billing_cycle}
              onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as Reservation['billing_cycle'] })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="field-label">Fee amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="field"
              value={form.fee_amount}
              onChange={(e) => setForm({ ...form, fee_amount: e.target.value })}
            />
            <FieldError errors={errors} name="fee_amount" />
          </div>
        </div>
        <button
          className="btn mt-4"
          onClick={addReservation}
          disabled={!form.plot_id || !form.family_id || !form.start_date || !form.fee_amount}
        >
          Create reservation
        </button>
      </div>
    </div>
  )
}
