<?php

use App\Models\Admin;
use App\Models\Siswa;
use App\Notifications\AdminEmailChangeVerification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

function createManageAdmin(string $name = 'Admin Utama', string $email = 'admin@example.test'): Admin
{
    return Admin::create([
        'nama' => $name,
        'email' => $email,
        'password' => 'Existing-admin-42',
    ]);
}

function verifyManageAdminPin(Admin $admin): void
{
    test()->actingAs($admin, 'admin')
        ->post(route('admin.manage-admin.verify-pin'), ['pin' => '12345678'])
        ->assertRedirect(route('admin.manage-admin.index'));
}

it('gates settings behind the initial PIN and never exposes email before verification', function () {
    $admin = createManageAdmin();

    $this->post(route('login'), [
        'email' => 'admin@example.test',
        'password' => '12345678',
    ])->assertSessionHasErrors('email');

    $this->actingAs($admin, 'admin')
        ->get(route('admin.manage-admin.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ManageAdmin')
            ->where('verified', false)
            ->where('email', null)
            ->where('pendingEmail', null)
            ->where('auth.user.nama', 'Admin Utama'));

    $this->post(route('admin.manage-admin.verify-pin'), ['pin' => '87654321'])
        ->assertSessionHasErrors('pin');

    expect(session()->get('admin_manage_admin_verified_at'))->toBeNull();

    $this->post(route('admin.manage-admin.verify-pin'), ['pin' => '12345678'])
        ->assertRedirect(route('admin.manage-admin.index'));

    expect(Hash::check('12345678', $admin->fresh()->pin_hash))->toBeTrue();

    $this->get(route('admin.manage-admin.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('verified', true)
            ->where('email', 'admin@example.test'));
});

it('changes the PIN only after checking the current PIN and invalidates the verified session', function () {
    $admin = createManageAdmin();
    verifyManageAdminPin($admin);

    $this->put(route('admin.manage-admin.pin'), [
        'current_pin' => '12345678',
        'pin' => '24681357',
        'pin_confirmation' => '24681357',
    ])->assertRedirect(route('admin.manage-admin.index'));

    expect(Hash::check('24681357', $admin->fresh()->pin_hash))->toBeTrue()
        ->and(Hash::check('12345678', $admin->fresh()->pin_hash))->toBeFalse();

    $this->get(route('admin.manage-admin.index'))
        ->assertInertia(fn (Assert $page) => $page->where('verified', false)->where('email', null));

    $this->post(route('admin.manage-admin.verify-pin'), ['pin' => '12345678'])
        ->assertSessionHasErrors('pin');
    $this->post(route('admin.manage-admin.verify-pin'), ['pin' => '24681357'])
        ->assertRedirect(route('admin.manage-admin.index'));
});

it('keeps an email change pending until the signed verification link is used', function () {
    Notification::fake();
    $admin = createManageAdmin();
    verifyManageAdminPin($admin);

    $this->put(route('admin.manage-admin.email'), ['email' => 'real.admin@example.test'])
        ->assertSessionHas('success');

    expect($admin->fresh()->email)->toBe('admin@example.test')
        ->and($admin->fresh()->email_pending)->toBe('real.admin@example.test');

    $verificationUrl = null;
    Notification::assertSentOnDemand(
        AdminEmailChangeVerification::class,
        function (AdminEmailChangeVerification $notification, array $channels, object $notifiable) use (&$verificationUrl): bool {
            $verificationUrl = $notification->verificationUrl;

            return $channels === ['mail']
                && $notifiable->routeNotificationFor('mail') === 'real.admin@example.test';
        }
    );

    expect($verificationUrl)->not->toBeNull();

    $this->get($verificationUrl)->assertRedirect(route('login'));

    expect($admin->fresh()->email)->toBe('real.admin@example.test')
        ->and($admin->fresh()->email_pending)->toBeNull();

    $this->post(route('login'), [
        'email' => 'real.admin@example.test',
        'password' => 'Existing-admin-42',
    ])->assertRedirect(route('admin.dashboard', absolute: false));
});

it('requires the current password and preserves password-based login after a change', function () {
    $admin = createManageAdmin();
    verifyManageAdminPin($admin);

    $this->put(route('admin.manage-admin.password'), [
        'current_password' => 'incorrect',
        'password' => 'New-admin-pass-43',
        'password_confirmation' => 'New-admin-pass-43',
    ])->assertSessionHasErrors('current_password');

    $this->put(route('admin.manage-admin.password'), [
        'current_password' => 'Existing-admin-42',
        'password' => 'New-admin-pass-43',
        'password_confirmation' => 'New-admin-pass-43',
    ])->assertSessionHas('success');

    expect(Hash::check('New-admin-pass-43', $admin->fresh()->password))->toBeTrue();

    auth('admin')->logout();
    $this->post(route('login'), [
        'email' => 'admin@example.test',
        'password' => 'Existing-admin-42',
    ])->assertSessionHasErrors('email');

    $this->post(route('login'), [
        'email' => 'admin@example.test',
        'password' => 'New-admin-pass-43',
    ])->assertRedirect(route('admin.dashboard', absolute: false));
});

it('protects credential changes from unverified and non-primary admin sessions', function () {
    $mainAdmin = createManageAdmin();

    $this->get(route('admin.manage-admin.index'))
        ->assertRedirect(route('login'));

    $this->actingAs($mainAdmin, 'admin')
        ->put(route('admin.manage-admin.password'), [
            'current_password' => 'Existing-admin-42',
            'password' => 'New-admin-pass-43',
            'password_confirmation' => 'New-admin-pass-43',
        ])
        ->assertRedirect(route('admin.manage-admin.index'));

    expect(Hash::check('Existing-admin-42', $mainAdmin->fresh()->password))->toBeTrue();

    $otherAdmin = createManageAdmin('Other Admin', 'other.admin@example.test');

    $this->actingAs($otherAdmin, 'admin')
        ->get(route('admin.manage-admin.index'))
        ->assertForbidden();
});

it('expires PIN authorization before protected settings can be changed', function () {
    $admin = createManageAdmin();

    $this->actingAs($admin, 'admin')->withSession([
        'admin_manage_admin_verified_at' => now()->subMinutes(11)->timestamp,
    ])->put(route('admin.manage-admin.email'), ['email' => 'expired@example.test'])
        ->assertRedirect(route('admin.manage-admin.index'))
        ->assertSessionHas('error');

    expect($admin->fresh()->email_pending)->toBeNull();
});

it('rejects email addresses already assigned to a student account', function () {
    $admin = createManageAdmin();
    $student = Siswa::create([
        'nama' => 'Siswa Existing',
        'email' => 'student@example.test',
        'password' => 'Student-pass-42',
        'status_akun' => 'aktif',
    ]);
    verifyManageAdminPin($admin);

    $this->put(route('admin.manage-admin.email'), ['email' => $student->email])
        ->assertSessionHasErrors('email');

    expect($admin->fresh()->email)->toBe('admin@example.test')
        ->and($admin->fresh()->email_pending)->toBeNull();
});

it('throttles repeated PIN verification attempts', function () {
    $admin = createManageAdmin();
    $this->actingAs($admin, 'admin');

    foreach (range(1, 5) as $_) {
        $this->post(route('admin.manage-admin.verify-pin'), ['pin' => '87654321'])
            ->assertSessionHasErrors('pin');
    }

    $this->post(route('admin.manage-admin.verify-pin'), ['pin' => '87654321'])
        ->assertTooManyRequests();
});
