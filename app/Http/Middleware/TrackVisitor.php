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

        if (!$request->session()->has('visited_today')) {
            $request->session()->put('visited_today', true);
            
            $stat = StatistikPengunjung::firstOrCreate(
                ['tanggal' => now()->toDateString()],
                ['jumlah_siswa' => 0, 'jumlah_tamu' => 0]
            );
            
            if (Auth::guard('siswa')->check()) {
                $stat->increment('jumlah_siswa');
            } else {
                $stat->increment('jumlah_tamu');
            }
        }

        return $next($request);
    }
}
