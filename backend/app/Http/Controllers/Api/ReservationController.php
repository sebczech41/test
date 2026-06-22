<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        return Reservation::query()
            ->when($request->query('family_id'), fn ($q, $id) => $q->where('family_id', $id))
            ->when($request->query('plot_id'), fn ($q, $id) => $q->where('plot_id', $id))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->with(['plot.site', 'family'])
            ->orderByDesc('start_date')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plot_id' => ['required', 'exists:plots,id'],
            'family_id' => ['required', 'exists:families,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'fee_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $reservation = DB::transaction(function () use ($data) {
            $data['next_due_date'] = $data['start_date'];

            $reservation = Reservation::create($data);
            $reservation->plot()->update(['status' => 'reserved']);

            Payment::create([
                'reservation_id' => $reservation->id,
                'amount' => $reservation->fee_amount,
                'due_date' => $reservation->next_due_date,
                'status' => 'pending',
            ]);

            return $reservation;
        });

        return response()->json($reservation->load(['plot', 'family']), 201);
    }

    public function show(Reservation $reservation)
    {
        return $reservation->load(['plot.site', 'family', 'payments']);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'billing_cycle' => ['sometimes', 'in:monthly,yearly'],
            'fee_amount' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:active,cancelled,expired'],
        ]);

        $reservation->update($data);

        if (in_array($reservation->status, ['cancelled', 'expired'], true)) {
            $reservation->plot()->update(['status' => 'available']);
        }

        return $reservation;
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->plot()->update(['status' => 'available']);
        $reservation->delete();

        return response()->noContent();
    }
}
