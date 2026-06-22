<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        return Payment::query()
            ->when($request->query('reservation_id'), fn ($q, $id) => $q->where('reservation_id', $id))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('family_id'), function ($q, $familyId) {
                $q->whereHas('reservation', fn ($r) => $r->where('family_id', $familyId));
            })
            ->with('reservation.family', 'reservation.plot')
            ->orderByDesc('due_date')
            ->get();
    }

    public function show(Payment $payment)
    {
        return $payment->load('reservation.family', 'reservation.plot');
    }

    public function update(Request $request, Payment $payment)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,paid,overdue'],
        ]);

        if ($data['status'] === 'paid' && $payment->status !== 'paid') {
            $data['paid_at'] = now();
        }

        $payment->update($data);

        return $payment;
    }
}
