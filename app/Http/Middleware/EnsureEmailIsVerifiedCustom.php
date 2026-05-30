<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerifiedCustom
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('siswa');

        if ($user && ! $user->hasVerifiedEmail()) {
            // Allowed routes for unverified students: verification notice/verify/send, basic profile edit/update, and logout
            $allowedRoutes = [
                'verification.notice',
                'verification.verify',
                'verification.send',
                'profile.edit',
                'profile.update',
                'logout',
            ];

            if (! $request->routeIs($allowedRoutes)) {
                return $request->expectsJson()
                    ? abort(403, 'Silakan verifikasi email Anda terlebih dahulu untuk mengakses seluruh fitur aplikasi.')
                    : redirect()->route('verification.notice');
            }
        }

        return $next($request);
    }
}
