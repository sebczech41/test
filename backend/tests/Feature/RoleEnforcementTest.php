<?php

namespace Tests\Feature;

use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleEnforcementTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_cannot_delete_a_site(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $site = Site::create(['name' => 'Protected Site']);

        $this->actingAs($staff, 'sanctum')
            ->deleteJson("/api/sites/{$site->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('sites', ['id' => $site->id]);
    }

    public function test_admin_can_delete_a_site(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $site = Site::create(['name' => 'Doomed Site']);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/sites/{$site->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('sites', ['id' => $site->id]);
    }

    public function test_staff_cannot_view_audit_logs(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $this->actingAs($staff, 'sanctum')
            ->getJson('/api/audit-logs')
            ->assertForbidden();
    }

    public function test_audit_log_records_creations(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/sites', ['name' => 'Audited Site'])
            ->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'created',
            'auditable_type' => 'Site',
        ]);
    }
}
