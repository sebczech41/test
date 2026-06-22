import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import { api } from '../api/client'
import type { Booking, Site, Family, Plot } from '../api/types'
import Modal from '../components/Modal'

const typeColors: Record<Booking['type'], string> = {
  burial: '#5b4636',
  cremation: '#8a6d3b',
  appointment: '#2f6f4f',
  other: '#555',
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [form, setForm] = useState({
    site_id: '',
    plot_id: '',
    family_id: '',
    type: 'appointment' as Booking['type'],
    title: '',
    starts_at: '',
    ends_at: '',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [b, s, f, p] = await Promise.all([
      api.get('/bookings'),
      api.get('/sites'),
      api.get('/families'),
      api.get('/plots'),
    ])
    setBookings(b.data)
    setSites(s.data)
    setFamilies(f.data)
    setPlots(p.data)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate(dateStr?: string) {
    setSelected(null)
    setError(null)
    setForm({
      site_id: sites[0]?.id.toString() ?? '',
      plot_id: '',
      family_id: '',
      type: 'appointment',
      title: '',
      starts_at: dateStr ? `${dateStr}T10:00` : '',
      ends_at: dateStr ? `${dateStr}T11:00` : '',
      notes: '',
    })
    setShowForm(true)
  }

  function handleDateClick(arg: DateClickArg) {
    openCreate(arg.dateStr.slice(0, 10))
  }

  function handleEventClick(arg: EventClickArg) {
    const booking = bookings.find((b) => b.id === Number(arg.event.id))
    if (booking) setSelected(booking)
  }

  async function handleSubmit() {
    setError(null)
    try {
      await api.post('/bookings', {
        site_id: Number(form.site_id),
        plot_id: form.plot_id ? Number(form.plot_id) : null,
        family_id: form.family_id ? Number(form.family_id) : null,
        type: form.type,
        title: form.title,
        starts_at: form.starts_at,
        ends_at: form.ends_at,
        notes: form.notes || null,
      })
      setShowForm(false)
      load()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not save booking.'
      setError(message)
    }
  }

  async function handleCancel(booking: Booking) {
    await api.put(`/bookings/${booking.id}`, { status: 'cancelled' })
    setSelected(null)
    load()
  }

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <button onClick={() => openCreate()}>+ New booking</button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
        events={bookings
          .filter((b) => b.status !== 'cancelled')
          .map((b) => ({
            id: String(b.id),
            title: `${b.title} (${b.type})`,
            start: b.starts_at,
            end: b.ends_at,
            backgroundColor: typeColors[b.type],
            borderColor: typeColors[b.type],
          }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />

      {showForm && (
        <Modal title="New booking" onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <label>
              Site
              <select value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value })}>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Booking['type'] })}>
                <option value="appointment">Appointment</option>
                <option value="burial">Burial</option>
                <option value="cremation">Cremation</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Plot (optional)
              <select value={form.plot_id} onChange={(e) => setForm({ ...form, plot_id: e.target.value })}>
                <option value="">—</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Family (optional)
              <select value={form.family_id} onChange={(e) => setForm({ ...form, family_id: e.target.value })}>
                <option value="">—</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Starts at
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </label>
            <label>
              Ends at
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </label>
            <label className="span-2">
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button onClick={handleSubmit}>Save booking</button>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <p>
            <strong>Type:</strong> {selected.type}
          </p>
          <p>
            <strong>When:</strong> {new Date(selected.starts_at).toLocaleString()} –{' '}
            {new Date(selected.ends_at).toLocaleString()}
          </p>
          {selected.family && (
            <p>
              <strong>Family:</strong> {selected.family.name}
            </p>
          )}
          {selected.plot && (
            <p>
              <strong>Plot:</strong> {selected.plot.code}
            </p>
          )}
          {selected.notes && <p>{selected.notes}</p>}
          <button onClick={() => handleCancel(selected)}>Cancel booking</button>
        </Modal>
      )}
    </div>
  )
}
