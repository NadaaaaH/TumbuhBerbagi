<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Siswa;
use App\Models\User;
use App\Notifications\AdminEmailChangeVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminManageController extends Controller
{
    private const INITIAL_PIN = '12345678';

    private const VERIFICATION_SESSION_KEY = 'admin_manage_admin_verified_at';

    public function index(Request $request): Response
    {
        $admin = $this->admin($request);
        $verifiedAt = $request->session()->get(self::VERIFICATION_SESSION_KEY);
        $age = is_numeric($verifiedAt) ? now()->timestamp - (int) $verifiedAt : null;
        $verified = $age !== null && $age >= 0 && $age <= 600;

        if (! $verified) {
            $request->session()->forget(self::VERIFICATION_SESSION_KEY);
        }

        return Inertia::render('Admin/ManageAdmin', [
            'verified' => $verified,
            'email' => $verified ? $admin->email : null,
            'pendingEmail' => $verified ? $admin->email_pending : null,
        ]);
    }

    public function verifyPin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pin' => ['required', 'string', 'digits_between:8,12'],
        ]);
        $admin = $this->admin($request);

        if ($admin->pin_hash === null) {
            Admin::query()
                ->whereKey($admin->getKey())
                ->whereNull('pin_hash')
                ->update(['pin_hash' => Hash::make(self::INITIAL_PIN)]);
            $admin->refresh();
        }

        if ($admin->pin_hash === null || ! Hash::check($validated['pin'], $admin->pin_hash)) {
            throw ValidationException::withMessages([
                'pin' => 'PIN yang dimasukkan tidak sesuai.',
            ]);
        }

        $request->session()->put(self::VERIFICATION_SESSION_KEY, now()->timestamp);

        return redirect()->route('admin.manage-admin.index');
    }

    public function updateEmail(Request $request): RedirectResponse
    {
        $admin = $this->admin($request);
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:100',
                Rule::unique('admin', 'email')->ignore($admin->getKey(), 'id_admin'),
                Rule::unique('admin', 'email_pending')->ignore($admin->getKey(), 'id_admin'),
                Rule::unique('siswa', 'email'),
                Rule::unique('users', 'email'),
            ],
        ]);

        if ($validated['email'] === $admin->email) {
            return back()->with('success', 'Email tersebut sudah menjadi email aktif akun admin.');
        }

        DB::transaction(function () use ($admin, $validated): void {
            $admin->forceFill(['email_pending' => $validated['email']])->save();

            $verificationUrl = URL::temporarySignedRoute(
                'admin.email.verify',
                now()->addMinutes(60),
                [
                    'adminId' => $admin->getKey(),
                    'emailHash' => hash('sha256', $validated['email']),
                ]
            );

            Notification::route('mail', $validated['email'])
                ->notify(new AdminEmailChangeVerification($verificationUrl));
        });

        return back()->with('success', 'Tautan verifikasi telah dikirim ke email baru. Email aktif belum berubah.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:admin'],
            'password' => ['required', 'string', 'max:100', Password::min(8)->letters()->numbers(), 'confirmed'],
        ]);

        $this->admin($request)->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return back()->with('success', 'Password akun admin berhasil diperbarui.');
    }

    public function updatePin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_pin' => ['required', 'string', 'digits_between:8,12'],
            'pin' => ['required', 'string', 'digits_between:8,12', 'different:current_pin', 'confirmed'],
        ]);
        $admin = $this->admin($request);

        if ($admin->pin_hash === null || ! Hash::check($validated['current_pin'], $admin->pin_hash)) {
            throw ValidationException::withMessages([
                'current_pin' => 'PIN saat ini tidak sesuai.',
            ]);
        }

        $admin->forceFill(['pin_hash' => Hash::make($validated['pin'])])->save();
        $request->session()->forget(self::VERIFICATION_SESSION_KEY);

        return redirect()
            ->route('admin.manage-admin.index')
            ->with('success', 'PIN berhasil diubah. Verifikasi ulang dengan PIN baru untuk melanjutkan.');
    }

    public function verifyEmailChange(Request $request, int $adminId, string $emailHash): RedirectResponse
    {
        $admin = Admin::query()->findOrFail($adminId);
        $pendingEmail = $admin->email_pending;

        abort_unless(
            $pendingEmail !== null && hash_equals(hash('sha256', $pendingEmail), $emailHash),
            403
        );

        if (
            Admin::query()->where('email', $pendingEmail)->where('id_admin', '!=', $admin->getKey())->exists()
            || Siswa::query()->where('email', $pendingEmail)->exists()
            || User::query()->where('email', $pendingEmail)->exists()
        ) {
            return redirect()->route('login')->with('status', 'Email baru tidak dapat digunakan karena sudah terdaftar pada akun lain.');
        }

        $admin->forceFill([
            'email' => $pendingEmail,
            'email_pending' => null,
        ])->save();

        return redirect()->route('login')->with('status', 'Email Admin berhasil diverifikasi dan sekarang menjadi email aktif.');
    }

    private function admin(Request $request): Admin
    {
        $admin = $request->user('admin');
        abort_unless($admin instanceof Admin, 403);

        return $admin;
    }
}
