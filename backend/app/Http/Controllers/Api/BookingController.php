<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        return Booking::query()
            ->when($request->query('site_id'), fn ($q, $id) => $q->where('site_id', $id))
            ->when($request->query('from'), fn ($q, $from) => $q->where('starts_at', '>=', $from))
            ->when($request->query('to'), fn ($q, $to) => $q->where('ends_at', '<=', $to))
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->with(['site', 'plot', 'family', 'staff'])
            ->orderBy('starts_at')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'site_id' => ['required', 'exists:sites,id'],
            'plot_id' => ['nullable', 'exists:plots,id'],
            'family_id' => ['nullable', 'exists:families,id'],
            'staff_id' => ['nullable', 'exists:users,id'],
            'type' => ['required', 'in:burial,cremation,appointment,other'],
            'title' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
        ]);

        $overlapping = Booking::where('site_id', $data['site_id'])
            ->when(! empty($data['plot_id']), fn ($q) => $q->where('plot_id', $data['plot_id']))
            ->where('status', 'scheduled')
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'This slot overlaps with an existing booking.',
            ], 422);
        }

        return response()->json(Booking::create($data)->load(['site', 'plot', 'family', 'staff']), 201);
    }

    public function show(Booking $booking)
    {
        return $booking->load(['site', 'plot', 'family', 'staff']);
    }

    public function update(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'plot_id' => ['nullable', 'exists:plots,id'],
            'family_id' => ['nullable', 'exists:families,id'],
            'staff_id' => ['nullable', 'exists:users,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'status' => ['sometimes', 'in:scheduled,completed,cancelled'],
        ]);

        $booking->update($data);

        return $booking;
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return response()->noContent();
    }
}
