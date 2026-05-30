<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
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

        if ($user && $user->hasVerifiedEmail() && $user->force_password_change) {
            // Allowed routes for password change and logout
            $allowedRoutes = [
                'password.change',
                'password.change.save',
                'logout',
            ];

            if (! $request->routeIs($allowedRoutes)) {
                return $request->expectsJson()
                    ? abort(403, 'Anda wajib mengganti password sementara terlebih dahulu.')
                    : redirect()->route('password.change');
            }
        }

        return $next($request);
    }
}
