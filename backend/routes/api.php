<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeceasedController;
use App\Http\Controllers\Api\FamilyController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PlotController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', DashboardController::class);

    Route::apiResource('sites', SiteController::class)->except('destroy');
    Route::apiResource('plots', PlotController::class)->except('destroy');
    Route::apiResource('families', FamilyController::class)->except('destroy');
    Route::apiResource('reservations', ReservationController::class)->except('destroy');
    Route::apiResource('bookings', BookingController::class)->except('destroy');
    Route::apiResource('deceased', DeceasedController::class)->except('destroy')
        ->parameters(['deceased' => 'deceased']);
    Route::apiResource('payments', PaymentController::class)->only(['index', 'show', 'update']);

    Route::middleware(EnsureAdmin::class)->group(function () {
        Route::delete('sites/{site}', [SiteController::class, 'destroy']);
        Route::delete('plots/{plot}', [PlotController::class, 'destroy']);
        Route::delete('families/{family}', [FamilyController::class, 'destroy']);
        Route::delete('reservations/{reservation}', [ReservationController::class, 'destroy']);
        Route::delete('bookings/{booking}', [BookingController::class, 'destroy']);
        Route::delete('deceased/{deceased}', [DeceasedController::class, 'destroy']);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
    });
});
