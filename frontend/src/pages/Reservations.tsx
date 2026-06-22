import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Family, Plot, Reservation } from '../api/types'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [form, setForm] = useState({
    plot_id: '',
    family_id: '',
    start_date: '',
    billing_cycle: 'yearly' as Reservation['billing_cycle'],
    fee_amount: '',
  })
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [r, p, f] = await Promise.all([
      api.get('/reservations'),
      api.get('/plots', { params: { status: 'available' } }),
      api.get('/families'),
    ])
    setReservations(r.data)
    setPlots(p.data)
    setFamilies(f.data)
  }

  useEffect(() => {
    load()
  }, [])

  async function addReservation() {
    setError(null)
    try {
      await api.post('/reservations', {
        plot_id: Number(form.plot_id),
        family_id: Number(form.family_id),
        start_date: form.start_date,
        billing_cycle: form.billing_cycle,
        fee_amount: Number(form.fee_amount),
      })
      setForm({ plot_id: '', family_id: '', start_date: '', billing_cycle: 'yearly', fee_amount: '' })
      load()
    } catch {
      setError('Could not create reservation. Check all fields are filled.')
    }
  }

  async function cancelReservation(r: Reservation) {
    await api.put(`/reservations/${r.id}`, { status: 'cancelled' })
    load()
  }

  return (
    <div className="panel">
      <h2>Plot reservations & fees</h2>
      <table>
        <thead>
          <tr>
            <th>Plot</th>
            <th>Family</th>
            <th>Start</th>
            <th>Billing</th>
            <th>Fee</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.plot?.code}</td>
              <td>{r.family?.name}</td>
              <td>{r.start_date.slice(0, 10)}</td>
              <td>{r.billing_cycle}</td>
              <td>${r.fee_amount}</td>
              <td>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
              </td>
              <td>
                {r.status === 'active' && <button onClick={() => cancelReservation(r)}>Cancel</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>New reservation</h3>
      <div className="form-grid">
        <label>
          Available plot
          <select value={form.plot_id} onChange={(e) => setForm({ ...form, plot_id: e.target.value })}>
            <option value="">Select plot…</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.site?.name} — {p.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          Family
          <select value={form.family_id} onChange={(e) => setForm({ ...form, family_id: e.target.value })}>
            <option value="">Select family…</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </label>
        <label>
          Billing cycle
          <select
            value={form.billing_cycle}
            onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as Reservation['billing_cycle'] })}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <label>
          Fee amount
          <input
            type="number"
            step="0.01"
            value={form.fee_amount}
            onChange={(e) => setForm({ ...form, fee_amount: e.target.value })}
          />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button onClick={addReservation}>Create reservation</button>
    </div>
  )
}
