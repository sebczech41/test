import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { DashboardData } from '../api/types'
import { Spinner, StatusBadge } from '../components/ui'

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

/** Single-hue ordinal meter: available (lightest) → reserved → occupied (darkest). */
function OccupancyMeter({ totals }: { totals: DashboardData['plot_totals'] }) {
  const segments = [
    { label: 'Available', value: totals.available, color: 'var(--color-seq-250)' },
    { label: 'Reserved', value: totals.reserved, color: 'var(--color-seq-450)' },
    { label: 'Occupied', value: totals.occupied, color: 'var(--color-seq-650)' },
  ].filter((s) => s.value > 0)

  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded" role="img" aria-label={`${totals.available} available, ${totals.reserved} reserved, ${totals.occupied} occupied of ${totals.total} plots`}>
        {segments.map((s, i) => (
          <div
            key={s.label}
            className={i > 0 ? 'border-l-2 border-surface' : ''}
            style={{ width: `${(s.value / totals.total) * 100}%`, backgroundColor: s.color }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-ink-secondary">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label} <span className="font-medium text-ink">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setData(data))
  }, [])

  if (!data) return <Spinner />

  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Bookings this week" value={String(data.bookings_this_week)} hint="Scheduled in the next 7 days" />
        <StatTile label="Occupancy" value={`${data.occupancy_rate}%`} hint={`${data.plot_totals.total} plots across ${data.sites_count} sites`} />
        <StatTile label="Outstanding fees" value={money(data.pending_payments_total)} hint={`${data.overdue_payments.length} overdue`} />
        <StatTile label="Revenue this month" value={money(data.revenue_this_month)} hint="Paid fees" />
      </div>

      <div className="panel">
        <h2 className="mb-4 text-sm font-semibold">Plot occupancy</h2>
        <OccupancyMeter totals={data.plot_totals} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Upcoming bookings</h2>
            <Link to="/calendar" className="text-xs text-brand-700 hover:underline">Open calendar →</Link>
          </div>
          {data.upcoming_bookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">Nothing scheduled.</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {data.upcoming_bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(b.starts_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · {b.site?.name}
                    </p>
                  </div>
                  <StatusBadge status={b.type} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Overdue fees</h2>
            <Link to="/payments" className="text-xs text-brand-700 hover:underline">All payments →</Link>
          </div>
          {data.overdue_payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">No overdue fees. 🎉</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {data.overdue_payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{p.reservation?.family?.name}</p>
                    <p className="text-xs text-ink-muted">
                      Plot {p.reservation?.plot?.code} · due {p.due_date.slice(0, 10)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-status-critical">${p.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
