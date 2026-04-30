<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth:siswa', 'verified'])->name('dashboard');

Route::middleware('auth:admin')->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('AdminDashboard');
    })->name('admin.dashboard');

    Route::resource('admin/siswa', App\Http\Controllers\Admin\SiswaController::class);
    Route::resource('admin/jadwal', App\Http\Controllers\Admin\JadwalController::class);
    Route::resource('admin/kegiatan', App\Http\Controllers\Admin\KegiatanController::class);
    Route::resource('admin/soal', App\Http\Controllers\Admin\SoalController::class);
    Route::patch('admin/soal/{id}/toggle-status', [App\Http\Controllers\Admin\SoalController::class, 'toggleStatus'])->name('soal.toggleStatus');
});

Route::middleware('auth:siswa')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/jadwal', [App\Http\Controllers\Siswa\JadwalController::class, 'index'])->name('siswa.jadwal');
    Route::get('/kegiatan', [App\Http\Controllers\Siswa\KegiatanController::class, 'index'])->name('siswa.kegiatan.index');
    Route::get('/kegiatan/{id}', [App\Http\Controllers\Siswa\KegiatanController::class, 'show'])->name('siswa.kegiatan.show');
});

require __DIR__ . '/auth.php';
