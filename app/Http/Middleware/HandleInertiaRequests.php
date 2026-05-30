<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $siswa = $request->user('siswa');
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $siswa ?? $request->user('admin') ?? $request->user('web'),
                'role' => $request->user('admin') ? 'admin' : ($siswa ? 'siswa' : null),
                'notifications' => $siswa
                    ? \App\Models\Notifikasi::where('id_siswa', $siswa->id_siswa)
                        ->orderBy('created_at', 'desc')
                        ->get()
                    : [],
            ],
        ];
    }
}
