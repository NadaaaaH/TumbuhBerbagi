<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use App\Models\SesiLatihan;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile page (view only).
     */
    public function show(Request $request): Response
    {
        $user = $request->user();

        $stats = [
            'rata_rata_skor' => 0,
            'tryout_selesai' => 0,
            'soal_dikerjakan' => 0,
            'latsol_dikerjakan' => 0,
            'akurasi' => 0,
        ];

        if ($user && isset($user->id_siswa)) {
            // Ambil semua sesi latihan & tryout siswa yang sudah selesai (memiliki hasil_latihan)
            $completedSessions = SesiLatihan::where('id_siswa', $user->id_siswa)
                ->whereHas('hasil_latihan')
                ->with(['hasil_latihan', 'paket_latihan'])
                ->get();

            // 1. Tryout Selesai & Rata-rata Skor TO
            $tryoutSessions = $completedSessions->filter(function ($sesi) {
                return $sesi->paket_latihan && $sesi->paket_latihan->tipe === 'tryout';
            });

            $tryoutSelesai = $tryoutSessions->count();
            $toScores = $tryoutSessions->pluck('hasil_latihan.nilai_akhir')->filter(fn($val) => !is_null($val));
            $rataRataSkorTO = $toScores->count() > 0 ? round($toScores->avg(), 1) : 0;
            if ($rataRataSkorTO == (int)$rataRataSkorTO) {
                $rataRataSkorTO = (int)$rataRataSkorTO;
            }

            // 2. Latihan Soal (Latsol) Dikerjakan
            $latsolSessions = $completedSessions->filter(function ($sesi) {
                return $sesi->paket_latihan && ($sesi->paket_latihan->tipe === 'latihan' || is_null($sesi->paket_latihan->tipe));
            });
            $latsolDikerjakan = $latsolSessions->count();

            // 3. Akurasi Jawaban
            // Semua akurasi di setiap paket soal yang dia kerjakan dikumpulkan dan dirata-ratakan
            $totalAkurasi = 0;
            $totalPaket = $completedSessions->count();

            foreach ($completedSessions as $sesi) {
                $hasil = $sesi->hasil_latihan;
                $totalSoal = $hasil->total_soal ?? 0;
                $jumlahBenar = $hasil->jumlah_benar ?? 0;
                $akurasiPaket = $totalSoal > 0 ? (($jumlahBenar / $totalSoal) * 100) : 0;
                $totalAkurasi += $akurasiPaket;
            }

            $rataAkurasi = $totalPaket > 0 ? round($totalAkurasi / $totalPaket, 1) : 0;
            if ($rataAkurasi == (int)$rataAkurasi) {
                $rataAkurasi = (int)$rataAkurasi;
            }

            $stats = [
                'rata_rata_skor' => $rataRataSkorTO,
                'tryout_selesai' => $tryoutSelesai,
                'soal_dikerjakan' => $latsolDikerjakan,
                'latsol_dikerjakan' => $latsolDikerjakan,
                'akurasi' => $rataAkurasi,
            ];
        }

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'stats' => $stats,
            'status' => session('status'),
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->hasFile('foto_profil')) {
            // Hapus foto lama jika ada
            if ($user->foto_profil) {
                try {
                    Storage::delete($user->foto_profil);
                } catch (\Throwable $e) {}
            }
            $path = $request->file('foto_profil')->store('foto_profil');
            $validated['foto_profil'] = $path;
        } elseif ($request->boolean('hapus_foto')) {
            if ($user->foto_profil) {
                try {
                    Storage::delete($user->foto_profil);
                } catch (\Throwable $e) {}
            }
            $validated['foto_profil'] = null;
        } else {
            unset($validated['foto_profil']);
        }

        if ($request->filled('password')) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        } else {
            unset($validated['password']);
        }
        unset($validated['current_password']);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.show')->with('status', 'profile-updated');
    }

}
