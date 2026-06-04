<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\StatistikPengunjung;
use Illuminate\Support\Facades\Auth;

class TrackVisitor
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ignore API, admin, and asset requests
        if ($request->is('api/*') || $request->is('admin*') || $request->is('_debugbar*') || $request->wantsJson()) {
            return $next($request);
        }

        $today = now()->toDateString();
        $isSiswa = Auth::guard('siswa')->check();

        // Kunci session pakai tanggal supaya auto-reset tiap hari
        $sessionKeyTamu  = 'visited_tamu_'  . $today;
        $sessionKeySiswa = 'visited_siswa_' . $today;

        if ($isSiswa) {
            // Siswa login: catat sebagai siswa (hanya sekali per hari)
            if (!$request->session()->has($sessionKeySiswa)) {
                $request->session()->put($sessionKeySiswa, true);

                $stat = StatistikPengunjung::firstOrCreate(
                    ['tanggal' => $today],
                    ['jumlah_siswa' => 0, 'jumlah_tamu' => 0]
                );
                $stat->increment('jumlah_siswa');

                // Jika sebelumnya sudah terhitung sebagai tamu hari ini, kurangi
                if ($request->session()->has($sessionKeyTamu)) {
                    $stat->decrement('jumlah_tamu');
                    $request->session()->forget($sessionKeyTamu);
                }
            }
        } else {
            // Tamu: catat sebagai tamu (hanya sekali per hari, dan belum pernah tercatat sebagai siswa)
            if (!$request->session()->has($sessionKeyTamu) && !$request->session()->has($sessionKeySiswa)) {
                $request->session()->put($sessionKeyTamu, true);

                $stat = StatistikPengunjung::firstOrCreate(
                    ['tanggal' => $today],
                    ['jumlah_siswa' => 0, 'jumlah_tamu' => 0]
                );
                $stat->increment('jumlah_tamu');
            }
        }

        return $next($request);
    }
}
