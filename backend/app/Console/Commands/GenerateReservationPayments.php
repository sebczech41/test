<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('app:generate-reservation-payments')]
#[Description('Generate due fee payments for active reservations and flag overdue ones')]
class GenerateReservationPayments extends Command
{
    public function handle(): void
    {
        Payment::where('status', 'pending')
            ->where('due_date', '<', Carbon::today())
            ->update(['status' => 'overdue']);

        Reservation::where('status', 'active')
            ->where('next_due_date', '<=', Carbon::today())
            ->each(function (Reservation $reservation) {
                Payment::create([
                    'reservation_id' => $reservation->id,
                    'amount' => $reservation->fee_amount,
                    'due_date' => $reservation->next_due_date,
                    'status' => 'pending',
                ]);

                $next = $reservation->billing_cycle === 'monthly'
                    ? $reservation->next_due_date->copy()->addMonth()
                    : $reservation->next_due_date->copy()->addYear();

                $reservation->update(['next_due_date' => $next]);
            });

        $this->info('Reservation payments generated.');
    }
}
