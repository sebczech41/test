<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    public function index()
    {
        return Site::withCount('plots')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:64'],
        ]);

        return response()->json(Site::create($data), 201);
    }

    public function show(Site $site)
    {
        return $site->load('plots');
    }

    public function update(Request $request, Site $site)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:64'],
        ]);

        $site->update($data);

        return $site;
    }

    public function destroy(Site $site)
    {
        $site->delete();

        return response()->noContent();
    }
}
