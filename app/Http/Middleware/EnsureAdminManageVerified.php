<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminManageVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $verifiedAt = $request->session()->get('admin_manage_admin_verified_at');
        $age = is_numeric($verifiedAt) ? now()->timestamp - (int) $verifiedAt : null;

        if ($age === null || $age < 0 || $age > 600) {
            $request->session()->forget('admin_manage_admin_verified_at');

            return redirect()
                ->route('admin.manage-admin.index')
                ->with('error', 'Verifikasi PIN diperlukan untuk mengakses pengaturan admin.');
        }

        return $next($request);
    }
}
