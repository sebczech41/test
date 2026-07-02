export interface Site {
  id: number
  name: string
  address: string | null
  timezone: string
  plots_count?: number
}

export interface Plot {
  id: number
  site_id: number
  code: string
  type: 'grave' | 'niche' | 'mausoleum' | 'plot'
  section: string | null
  status: 'available' | 'reserved' | 'occupied'
  capacity: number
  site?: Site
}

export interface Family {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

export interface Reservation {
  id: number
  plot_id: number
  family_id: number
  start_date: string
  end_date: string | null
  billing_cycle: 'monthly' | 'yearly'
  fee_amount: string
  next_due_date: string | null
  status: 'active' | 'cancelled' | 'expired'
  plot?: Plot
  family?: Family
}

export interface Booking {
  id: number
  site_id: number
  plot_id: number | null
  family_id: number | null
  staff_id: number | null
  type: 'burial' | 'cremation' | 'appointment' | 'other'
  title: string
  notes: string | null
  starts_at: string
  ends_at: string
  status: 'scheduled' | 'completed' | 'cancelled'
  site?: Site
  plot?: Plot
  family?: Family
}

export interface Deceased {
  id: number
  plot_id: number
  family_id: number | null
  first_name: string
  last_name: string
  date_of_birth: string | null
  date_of_death: string | null
  interment_date: string | null
  interment_type: 'burial' | 'cremation'
  notes: string | null
  plot?: Plot
  family?: Family
}

export interface DashboardData {
  bookings_this_week: number
  upcoming_bookings: Booking[]
  overdue_payments: Payment[]
  pending_payments_total: number
  revenue_this_month: number
  plot_totals: { total: number; available: number; reserved: number; occupied: number }
  occupancy_rate: number
  sites_count: number
}

export interface Payment {
  id: number
  reservation_id: number
  amount: string
  due_date: string
  paid_at: string | null
  status: 'pending' | 'paid' | 'overdue'
  reservation?: Reservation
}
