import { useCallback, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import { api, fieldErrors } from '../api/client'
import type { Booking, Site, Family, Plot } from '../api/types'
import Modal from '../components/Modal'
import { FieldError, Spinner, StatusBadge } from '../components/ui'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

const typeColors: Record<Booking['type'], string> = {
  burial: '#4a3aa7',
  cremation: '#b45309',
  appointment: '#2f6f4f',
  other: '#52514e',
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
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
  const toast = useToast()
  const confirm = useConfirm()

  const load = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate(dateStr?: string) {
    setSelected(null)
    setErrors({})
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
    const booking = bookings?.find((b) => b.id === Number(arg.event.id))
    if (booking) setSelected(booking)
  }

  async function handleSubmit() {
    setErrors({})
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
      toast('Booking created')
      load()
    } catch (err) {
      const fields = fieldErrors(err)
      setErrors(
        Object.keys(fields).length
          ? fields
          : { _general: [(err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not save booking.'] },
      )
    }
  }

  async function handleCancel(booking: Booking) {
    const ok = await confirm({
      title: 'Cancel this booking?',
      message: `"${booking.title}" will be removed from the calendar.`,
      confirmLabel: 'Cancel booking',
      danger: true,
    })
    if (!ok) return
    await api.put(`/bookings/${booking.id}`, { status: 'cancelled' })
    setSelected(null)
    toast('Booking cancelled')
    load()
  }

  if (!bookings) return <Spinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <button className="btn" onClick={() => openCreate()}>
          + New booking
        </button>
      </div>

      <div className="panel">
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
      </div>

      <div className="flex gap-5 text-xs text-ink-secondary">
        {(Object.keys(typeColors) as Booking['type'][]).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 capitalize">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: typeColors[t] }} />
            {t}
          </span>
        ))}
      </div>

      {showForm && (
        <Modal title="New booking" onClose={() => setShowForm(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Site</label>
              <select className="field" value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value })}>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors} name="site_id" />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Booking['type'] })}>
                <option value="appointment">Appointment</option>
                <option value="burial">Burial</option>
                <option value="cremation">Cremation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="field-label">Plot (optional)</label>
              <select className="field" value={form.plot_id} onChange={(e) => setForm({ ...form, plot_id: e.target.value })}>
                <option value="">—</option>
                {plots
                  .filter((p) => !form.site_id || p.site_id === Number(form.site_id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}
                    </option>
                  ))}
              </select>
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
            <div className="sm:col-span-2">
              <label className="field-label">Title</label>
              <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <FieldError errors={errors} name="title" />
            </div>
            <div>
              <label className="field-label">Starts at</label>
              <input type="datetime-local" className="field" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              <FieldError errors={errors} name="starts_at" />
            </div>
            <div>
              <label className="field-label">Ends at</label>
              <input type="datetime-local" className="field" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              <FieldError errors={errors} name="ends_at" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Notes</label>
              <textarea className="field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          {errors._general && <p className="mt-3 text-sm text-status-critical">{errors._general[0]}</p>}
          <button className="btn mt-4" onClick={handleSubmit} disabled={!form.title || !form.starts_at || !form.ends_at}>
            Save booking
          </button>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <StatusBadge status={selected.type} />
              <StatusBadge status={selected.status} />
            </p>
            <p>
              <span className="text-ink-muted">When: </span>
              {new Date(selected.starts_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} –{' '}
              {new Date(selected.ends_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
            </p>
            <p>
              <span className="text-ink-muted">Site: </span>
              {selected.site?.name}
            </p>
            {selected.family && (
              <p>
                <span className="text-ink-muted">Family: </span>
                {selected.family.name}
              </p>
            )}
            {selected.plot && (
              <p>
                <span className="text-ink-muted">Plot: </span>
                {selected.plot.code}
              </p>
            )}
            {selected.notes && <p className="text-ink-secondary">{selected.notes}</p>}
          </div>
          {selected.status === 'scheduled' && (
            <button className="btn-danger mt-4" onClick={() => handleCancel(selected)}>
              Cancel booking
            </button>
          )}
        </Modal>
      )}
    </div>
  )
}
