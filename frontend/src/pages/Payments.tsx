import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Payment } from '../api/types'
import { EmptyState, Spinner, StatusBadge } from '../components/ui'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null)
  const [filter, setFilter] = useState<string>('')
  const toast = useToast()
  const confirm = useConfirm()

  const load = useCallback(async () => {
    const { data } = await api.get('/payments', { params: filter ? { status: filter } : {} })
    setPayments(data)
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  async function markPaid(p: Payment) {
    const ok = await confirm({
      title: 'Mark this fee as paid?',
      message: `$${p.amount} from ${p.reservation?.family?.name ?? 'this family'} will be recorded as received today.`,
      confirmLabel: 'Mark paid',
    })
    if (!ok) return
    await api.put(`/payments/${p.id}`, { status: 'paid' })
    toast('Payment recorded')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fees & payments</h1>
        <select className="field w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="panel">
        {!payments ? (
          <Spinner />
        ) : payments.length === 0 ? (
          <EmptyState title="No payments found" hint={filter ? `No ${filter} payments right now.` : 'Fees appear here when reservations generate them.'} />
        ) : (
          <table className="table-base">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="pb-2 pr-4 font-medium">Family</th>
                <th className="pb-2 pr-4 font-medium">Plot</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 pr-4 font-medium">Due date</th>
                <th className="pb-2 pr-4 font-medium">Paid at</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-4 font-medium">{p.reservation?.family?.name}</td>
                  <td className="py-2.5 pr-4">{p.reservation?.plot?.code}</td>
                  <td className="py-2.5 pr-4">${p.amount}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{p.due_date.slice(0, 10)}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{p.paid_at ? p.paid_at.slice(0, 10) : '—'}</td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-2.5 text-right">
                    {p.status !== 'paid' && (
                      <button className="btn !px-2.5 !py-1 text-xs" onClick={() => markPaid(p)}>
                        Mark paid
                      </button>
                    )}
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
