<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Family;
use App\Models\Payment;
use App\Models\Plot;
use App\Models\Reservation;
use App\Models\Site;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $site = Site::create([
            'name' => 'Greenwood Memorial Park',
            'address' => '123 Cemetery Rd',
            'timezone' => 'America/New_York',
        ]);

        $plotA = Plot::create([
            'site_id' => $site->id,
            'code' => 'A-101',
            'type' => 'grave',
            'section' => 'A',
            'status' => 'reserved',
        ]);

        $plotB = Plot::create([
            'site_id' => $site->id,
            'code' => 'A-102',
            'type' => 'grave',
            'section' => 'A',
            'status' => 'available',
        ]);

        $family = Family::create([
            'name' => 'The Smith Family',
            'email' => 'smith.family@example.com',
            'phone' => '555-0100',
        ]);

        $reservation = Reservation::create([
            'plot_id' => $plotA->id,
            'family_id' => $family->id,
            'start_date' => now()->subMonths(2)->toDateString(),
            'billing_cycle' => 'monthly',
            'fee_amount' => 45.00,
            'next_due_date' => now()->addDays(10)->toDateString(),
            'status' => 'active',
        ]);

        Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => $reservation->fee_amount,
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => 'pending',
        ]);

        Booking::create([
            'site_id' => $site->id,
            'plot_id' => $plotB->id,
            'family_id' => $family->id,
            'staff_id' => $admin->id,
            'type' => 'appointment',
            'title' => 'Plot viewing with Smith family',
            'starts_at' => now()->addDays(2)->setTime(10, 0),
            'ends_at' => now()->addDays(2)->setTime(11, 0),
        ]);
    }
}
