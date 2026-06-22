<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plot;
use Illuminate\Http\Request;

class PlotController extends Controller
{
    public function index(Request $request)
    {
        return Plot::query()
            ->when($request->query('site_id'), fn ($q, $siteId) => $q->where('site_id', $siteId))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->with('site')
            ->orderBy('code')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'site_id' => ['required', 'exists:sites,id'],
            'code' => ['required', 'string', 'max:50'],
            'type' => ['required', 'in:grave,niche,mausoleum,plot'],
            'section' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:available,reserved,occupied'],
            'capacity' => ['nullable', 'integer', 'min:1'],
        ]);

        return response()->json(Plot::create($data), 201);
    }

    public function show(Plot $plot)
    {
        return $plot->load(['site', 'reservations.family']);
    }

    public function update(Request $request, Plot $plot)
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:50'],
            'type' => ['sometimes', 'in:grave,niche,mausoleum,plot'],
            'section' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'in:available,reserved,occupied'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
        ]);

        $plot->update($data);

        return $plot;
    }

    public function destroy(Plot $plot)
    {
        $plot->delete();

        return response()->noContent();
    }
}
