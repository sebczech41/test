import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Calendar' },
  { to: '/sites', label: 'Sites & Plots' },
  { to: '/families', label: 'Families' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/payments', label: 'Payments' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Cemetery & Crematorium Manager</h1>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={() => logout()}>Log out</button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
