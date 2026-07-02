<?php

namespace Tests\Feature;

use App\Models\Family;
use App\Models\Payment;
use App\Models\Plot;
use App\Models\Reservation;
use App\Models\Site;
use App\Notifications\PaymentDueReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PaymentGenerationTest extends TestCase
{
    use RefreshDatabase;

    private function makeReservation(array $overrides = []): Reservation
    {
        $site = Site::create(['name' => 'Test Site']);
        $plot = Plot::create(['site_id' => $site->id, 'code' => 'T-001', 'type' => 'grave']);
        $family = Family::create(['name' => 'Test Family', 'email' => 'family@example.com']);

        return Reservation::create(array_merge([
            'plot_id' => $plot->id,
            'family_id' => $family->id,
            'start_date' => now()->subMonth()->toDateString(),
            'billing_cycle' => 'monthly',
            'fee_amount' => 50.00,
            'next_due_date' => now()->toDateString(),
            'status' => 'active',
        ], $overrides));
    }

    public function test_due_reservation_generates_payment_and_advances_next_due_date(): void
    {
        $reservation = $this->makeReservation();

        $this->artisan('app:generate-reservation-payments')->assertSuccessful();

        $this->assertDatabaseCount('payments', 1);
        $payment = Payment::first();
        $this->assertEquals('pending', $payment->status);
        $this->assertEquals(50.00, (float) $payment->amount);
        $this->assertEquals(
            now()->addMonth()->toDateString(),
            $reservation->fresh()->next_due_date->toDateString(),
        );
    }

    public function test_yearly_reservation_advances_by_one_year(): void
    {
        $reservation = $this->makeReservation(['billing_cycle' => 'yearly']);

        $this->artisan('app:generate-reservation-payments')->assertSuccessful();

        $this->assertEquals(
            now()->addYear()->toDateString(),
            $reservation->fresh()->next_due_date->toDateString(),
        );
    }

    public function test_overdue_payment_is_flagged_and_family_notified(): void
    {
        Notification::fake();

        $reservation = $this->makeReservation(['next_due_date' => now()->addYear()->toDateString()]);
        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => 50.00,
            'due_date' => now()->subDays(5)->toDateString(),
            'status' => 'pending',
        ]);

        $this->artisan('app:generate-reservation-payments')->assertSuccessful();

        $this->assertEquals('overdue', $payment->fresh()->status);
        Notification::assertSentTo($reservation->family, PaymentDueReminder::class);
    }

    public function test_cancelled_reservation_generates_no_payment(): void
    {
        $this->makeReservation(['status' => 'cancelled']);

        $this->artisan('app:generate-reservation-payments')->assertSuccessful();

        $this->assertDatabaseCount('payments', 0);
    }
}
