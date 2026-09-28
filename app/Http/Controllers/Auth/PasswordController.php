<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $rules = [];

        if ($request->has('email')) {
            $rules['email'] = [
                'required',
                'string',
                'lowercase',
                'email',
                'max:100',
                \Illuminate\Validation\Rule::unique(\App\Models\Siswa::class, 'email')->ignore($user->id_siswa, 'id_siswa'),
            ];
        }

        if ($request->filled('password') || $request->filled('current_password')) {
            $rules['current_password'] = ['required', 'current_password'];
            $rules['password'] = ['required', Password::defaults(), 'confirmed'];
        }

        $validated = $request->validate($rules);

        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('status', 'password-updated');
    }

    /**
     * Render the first-time password change view.
     */
    public function changeView(): Response
    {
        return Inertia::render('Auth/ChangePassword');
    }

    /**
     * Save the new password and mark force_password_change as false.
     */
    public function changeSave(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers()
            ],
        ]);

        $user = $request->user();
        
        $user->update([
            'password' => Hash::make($validated['password']),
            'force_password_change' => false,
        ]);

        try {
            \App\Models\AktivitasSiswa::log('change_password', 'Siswa berhasil mengganti password default pertama kali.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to log siswa activity: ' . $e->getMessage());
        }

        return redirect()->route('dashboard')->with('success', 'Password Anda berhasil diperbarui. Sekarang Anda memiliki akses penuh.');
    }
}

