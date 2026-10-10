<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminUtama
{
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user('admin');
        $adminUtamaId = Admin::query()->min('id_admin');

        abort_unless(
            $admin instanceof Admin && $adminUtamaId !== null && (int) $admin->getKey() === (int) $adminUtamaId,
            403
        );

        return $next($request);
    }
}
