<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Deceased;
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

    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'role' => 'staff',
        ]);

        $greenwood = Site::create([
            'name' => 'Greenwood Memorial Park',
            'address' => '123 Cemetery Rd',
            'timezone' => 'America/New_York',
        ]);

        $riverside = Site::create([
            'name' => 'Riverside Crematorium',
            'address' => '45 River Lane',
            'timezone' => 'America/New_York',
        ]);

        // Section A & B grave plots at Greenwood
        $plots = collect();
        foreach (['A', 'B'] as $section) {
            foreach (range(1, 12) as $i) {
                $plots->push(Plot::create([
                    'site_id' => $greenwood->id,
                    'code' => sprintf('%s-%03d', $section, $i),
                    'type' => 'grave',
                    'section' => $section,
                    'status' => 'available',
                ]));
            }
        }

        // Niches at Riverside
        foreach (range(1, 8) as $i) {
            Plot::create([
                'site_id' => $riverside->id,
                'code' => sprintf('N-%03d', $i),
                'type' => 'niche',
                'section' => 'Columbarium',
                'status' => 'available',
            ]);
        }

        $smith = Family::create([
            'name' => 'The Smith Family',
            'email' => 'smith.family@example.com',
            'phone' => '555-0100',
        ]);

        $garcia = Family::create([
            'name' => 'The Garcia Family',
            'email' => 'garcia.family@example.com',
            'phone' => '555-0111',
            'address' => '9 Elm Street',
        ]);

        // Smith: active monthly reservation on A-001 with pending payment
        $plotA1 = $plots->firstWhere('code', 'A-001');
        $plotA1->update(['status' => 'reserved']);
        $smithReservation = Reservation::create([
            'plot_id' => $plotA1->id,
            'family_id' => $smith->id,
            'start_date' => now()->subMonths(2)->toDateString(),
            'billing_cycle' => 'monthly',
            'fee_amount' => 45.00,
            'next_due_date' => now()->addDays(10)->toDateString(),
            'status' => 'active',
        ]);
        Payment::create([
            'reservation_id' => $smithReservation->id,
            'amount' => 45.00,
            'due_date' => now()->addDays(10)->toDateString(),
            'status' => 'pending',
        ]);
        Payment::create([
            'reservation_id' => $smithReservation->id,
            'amount' => 45.00,
            'due_date' => now()->subMonth()->toDateString(),
            'paid_at' => now()->subMonth(),
            'status' => 'paid',
        ]);

        // Garcia: yearly reservation on B-004, overdue payment, occupied plot with interment
        $plotB4 = $plots->firstWhere('code', 'B-004');
        $plotB4->update(['status' => 'occupied']);
        $garciaReservation = Reservation::create([
            'plot_id' => $plotB4->id,
            'family_id' => $garcia->id,
            'start_date' => now()->subYears(2)->toDateString(),
            'billing_cycle' => 'yearly',
            'fee_amount' => 320.00,
            'next_due_date' => now()->addMonths(4)->toDateString(),
            'status' => 'active',
        ]);
        Payment::create([
            'reservation_id' => $garciaReservation->id,
            'amount' => 320.00,
            'due_date' => now()->subDays(20)->toDateString(),
            'status' => 'overdue',
        ]);

        Deceased::create([
            'plot_id' => $plotB4->id,
            'family_id' => $garcia->id,
            'first_name' => 'Miguel',
            'last_name' => 'Garcia',
            'date_of_birth' => '1938-03-14',
            'date_of_death' => now()->subYears(2)->subDays(12)->toDateString(),
            'interment_date' => now()->subYears(2)->toDateString(),
            'interment_type' => 'burial',
        ]);

        Booking::create([
            'site_id' => $greenwood->id,
            'plot_id' => $plots->firstWhere('code', 'A-002')->id,
            'family_id' => $smith->id,
            'staff_id' => $admin->id,
            'type' => 'appointment',
            'title' => 'Plot viewing with Smith family',
            'starts_at' => now()->addDays(2)->setTime(10, 0),
            'ends_at' => now()->addDays(2)->setTime(11, 0),
        ]);

        Booking::create([
            'site_id' => $riverside->id,
            'family_id' => $garcia->id,
            'staff_id' => $admin->id,
            'type' => 'cremation',
            'title' => 'Cremation service — Garcia',
            'starts_at' => now()->addDays(5)->setTime(14, 0),
            'ends_at' => now()->addDays(5)->setTime(15, 30),
        ]);
    }
}
