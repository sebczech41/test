import type { ReactNode } from 'react'

const badgeStyles: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-800',
  active: 'bg-emerald-50 text-emerald-800',
  paid: 'bg-emerald-50 text-emerald-800',
  completed: 'bg-emerald-50 text-emerald-800',
  reserved: 'bg-amber-50 text-amber-800',
  pending: 'bg-amber-50 text-amber-800',
  scheduled: 'bg-sky-50 text-sky-800',
  occupied: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-50 text-red-800',
  overdue: 'bg-red-50 text-red-800',
  expired: 'bg-red-50 text-red-800',
}

const dotStyles: Record<string, string> = {
  available: 'bg-emerald-600',
  active: 'bg-emerald-600',
  paid: 'bg-emerald-600',
  completed: 'bg-emerald-600',
  reserved: 'bg-amber-500',
  pending: 'bg-amber-500',
  scheduled: 'bg-sky-600',
  occupied: 'bg-slate-500',
  cancelled: 'bg-red-600',
  overdue: 'bg-red-600',
  expired: 'bg-red-600',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${badgeStyles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      <span className={`size-1.5 rounded-full ${dotStyles[status] ?? 'bg-slate-500'}`} />
      {status}
    </span>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12" role="status" aria-label="Loading">
      <div className="size-7 animate-spin rounded-full border-2 border-hairline border-t-brand-600" />
    </div>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action}
    </div>
  )
}

export function FieldError({ errors, name }: { errors: Record<string, string[]>; name: string }) {
  if (!errors[name]?.length) return null
  return <p className="mt-1 text-xs text-status-critical">{errors[name][0]}</p>
}
