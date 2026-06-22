<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\FamilyController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PlotController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SiteController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('sites', SiteController::class);
    Route::apiResource('plots', PlotController::class);
    Route::apiResource('families', FamilyController::class);
    Route::apiResource('reservations', ReservationController::class);
    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('payments', PaymentController::class)->only(['index', 'show', 'update']);
});
