<?php

namespace Tests\Feature;

use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingOverlapTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    public function test_overlapping_booking_at_same_site_is_rejected(): void
    {
        $this->actingAsStaff();
        $site = Site::create(['name' => 'Test Site']);

        $payload = [
            'site_id' => $site->id,
            'type' => 'burial',
            'title' => 'First burial',
            'starts_at' => '2026-08-01 10:00:00',
            'ends_at' => '2026-08-01 11:00:00',
        ];

        $this->postJson('/api/bookings', $payload)->assertCreated();

        $this->postJson('/api/bookings', array_merge($payload, [
            'title' => 'Conflicting burial',
            'starts_at' => '2026-08-01 10:30:00',
            'ends_at' => '2026-08-01 11:30:00',
        ]))->assertStatus(422);
    }

    public function test_adjacent_booking_is_allowed(): void
    {
        $this->actingAsStaff();
        $site = Site::create(['name' => 'Test Site']);

        $payload = [
            'site_id' => $site->id,
            'type' => 'appointment',
            'title' => 'Morning slot',
            'starts_at' => '2026-08-01 10:00:00',
            'ends_at' => '2026-08-01 11:00:00',
        ];

        $this->postJson('/api/bookings', $payload)->assertCreated();

        $this->postJson('/api/bookings', array_merge($payload, [
            'title' => 'Back-to-back slot',
            'starts_at' => '2026-08-01 11:00:00',
            'ends_at' => '2026-08-01 12:00:00',
        ]))->assertCreated();
    }
}
