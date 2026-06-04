<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        // Redirect yang sudah login ke dashboard yang sesuai (admin / siswa)
        RedirectIfAuthenticated::redirectUsing(function ($request) {
            if (Auth::guard('admin')->check()) {
                return route('admin.dashboard');
            }
            if (Auth::guard('siswa')->check()) {
                return route('dashboard');
            }
            return route('dashboard');
        });
    }
}
