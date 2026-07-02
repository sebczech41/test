<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        return AuditLog::query()
            ->when($request->query('type'), fn ($q, $type) => $q->where('auditable_type', $type))
            ->with('user:id,name')
            ->latest()
            ->paginate(25);
    }
}
