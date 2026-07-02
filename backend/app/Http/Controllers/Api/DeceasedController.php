<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deceased;
use Illuminate\Http\Request;

class DeceasedController extends Controller
{
    public function index(Request $request)
    {
        return Deceased::query()
            ->when($request->query('plot_id'), fn ($q, $id) => $q->where('plot_id', $id))
            ->when($request->query('search'), function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->with(['plot.site', 'family'])
            ->orderBy('last_name')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plot_id' => ['required', 'exists:plots,id'],
            'family_id' => ['nullable', 'exists:families,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'date_of_death' => ['nullable', 'date'],
            'interment_date' => ['nullable', 'date'],
            'interment_type' => ['required', 'in:burial,cremation'],
            'notes' => ['nullable', 'string'],
        ]);

        $deceased = Deceased::create($data);
        $deceased->plot()->update(['status' => 'occupied']);

        return response()->json($deceased->load(['plot', 'family']), 201);
    }

    public function show(Deceased $deceased)
    {
        return $deceased->load(['plot.site', 'family']);
    }

    public function update(Request $request, Deceased $deceased)
    {
        $data = $request->validate([
            'family_id' => ['nullable', 'exists:families,id'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'date_of_death' => ['nullable', 'date'],
            'interment_date' => ['nullable', 'date'],
            'interment_type' => ['sometimes', 'in:burial,cremation'],
            'notes' => ['nullable', 'string'],
        ]);

        $deceased->update($data);

        return $deceased;
    }

    public function destroy(Deceased $deceased)
    {
        $deceased->delete();

        return response()->noContent();
    }
}
