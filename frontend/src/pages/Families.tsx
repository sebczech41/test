import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Family } from '../api/types'

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  async function load() {
    const { data } = await api.get('/families')
    setFamilies(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function addFamily() {
    if (!form.name.trim()) return
    await api.post('/families', form)
    setForm({ name: '', email: '', phone: '', address: '' })
    load()
  }

  return (
    <div className="panel">
      <h2>Families</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {families.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.email}</td>
              <td>{f.phone}</td>
              <td>{f.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="inline-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <button onClick={addFamily}>Add family</button>
      </div>
    </div>
  )
}
