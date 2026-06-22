import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Payment } from '../api/types'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState<string>('')

  async function load() {
    const { data } = await api.get('/payments', { params: filter ? { status: filter } : {} })
    setPayments(data)
  }

  useEffect(() => {
    load()
  }, [filter])

  async function markPaid(p: Payment) {
    await api.put(`/payments/${p.id}`, { status: 'paid' })
    load()
  }

  return (
    <div className="panel">
      <h2>Fees & payments</h2>
      <div className="inline-form">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Family</th>
            <th>Plot</th>
            <th>Amount</th>
            <th>Due date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.reservation?.family?.name}</td>
              <td>{p.reservation?.plot?.code}</td>
              <td>${p.amount}</td>
              <td>{p.due_date.slice(0, 10)}</td>
              <td>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </td>
              <td>{p.status !== 'paid' && <button onClick={() => markPaid(p)}>Mark paid</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
