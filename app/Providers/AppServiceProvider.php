<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
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

        RateLimiter::for('admin-pin', function (Request $request) {
            $adminId = $request->user('admin')?->getAuthIdentifier() ?? 'guest';

            return Limit::perMinute(5)->by('admin-manage-pin:'.$adminId.'|'.$request->ip());
        });

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
