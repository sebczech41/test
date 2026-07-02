<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Plot;
use App\Models\Site;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today = Carbon::today();
        $weekEnd = $today->copy()->addDays(7);
        $monthStart = $today->copy()->startOfMonth();

        $plotTotals = Plot::selectRaw("status, count(*) as total")->groupBy('status')->pluck('total', 'status');
        $totalPlots = (int) $plotTotals->sum();

        return [
            'bookings_this_week' => Booking::where('status', 'scheduled')
                ->whereBetween('starts_at', [$today, $weekEnd])
                ->count(),
            'upcoming_bookings' => Booking::where('status', 'scheduled')
                ->where('starts_at', '>=', $today)
                ->with(['site', 'family'])
                ->orderBy('starts_at')
                ->limit(5)
                ->get(),
            'overdue_payments' => Payment::where('status', 'overdue')
                ->with('reservation.family', 'reservation.plot')
                ->orderBy('due_date')
                ->get(),
            'pending_payments_total' => (float) Payment::whereIn('status', ['pending', 'overdue'])->sum('amount'),
            'revenue_this_month' => (float) Payment::where('status', 'paid')
                ->where('paid_at', '>=', $monthStart)
                ->sum('amount'),
            'plot_totals' => [
                'total' => $totalPlots,
                'available' => (int) ($plotTotals['available'] ?? 0),
                'reserved' => (int) ($plotTotals['reserved'] ?? 0),
                'occupied' => (int) ($plotTotals['occupied'] ?? 0),
            ],
            'occupancy_rate' => $totalPlots > 0
                ? round((($plotTotals['occupied'] ?? 0) + ($plotTotals['reserved'] ?? 0)) / $totalPlots * 100)
                : 0,
            'sites_count' => Site::count(),
        ];
    }
}
