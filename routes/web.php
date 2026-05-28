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
        'kegiatans' => \App\Models\Kegiatan::orderBy('tanggal', 'desc')->take(6)->get(),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth:siswa', 'verified'])->name('dashboard');

Route::middleware('auth:admin')->group(function () {
    Route::get('/admin/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::resource('admin/siswa', App\Http\Controllers\Admin\SiswaController::class);
    Route::resource('admin/jadwal', App\Http\Controllers\Admin\JadwalController::class);
    Route::resource('admin/kegiatan', App\Http\Controllers\Admin\KegiatanController::class);
    Route::resource('admin/soal', App\Http\Controllers\Admin\SoalController::class);
    Route::patch('admin/soal/{id}/toggle-status', [App\Http\Controllers\Admin\SoalController::class, 'toggleStatus'])->name('soal.toggleStatus');
    Route::resource('admin/paket-latihan', App\Http\Controllers\Admin\PaketLatihanController::class)->names('paket-latihan');
    Route::resource('admin/sesi-latihan', App\Http\Controllers\Admin\SesiLatihanController::class)->only(['index','show'])->names('sesi-latihan');
    Route::get('admin/sesi-latihan/{id}/export-all', [App\Http\Controllers\Admin\SesiLatihanController::class, 'exportAll'])->name('sesi-latihan.export-all');
    Route::get('admin/sesi-latihan/{id_sesi}/export-siswa', [App\Http\Controllers\Admin\SesiLatihanController::class, 'exportSiswa'])->name('sesi-latihan.export-siswa');
});

Route::middleware('auth:siswa')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/jadwal', [App\Http\Controllers\Siswa\JadwalController::class, 'index'])->name('siswa.jadwal');
    Route::get('/kegiatan', [App\Http\Controllers\Siswa\KegiatanController::class, 'index'])->name('siswa.kegiatan.index');
    Route::get('/kegiatan/{id}', [App\Http\Controllers\Siswa\KegiatanController::class, 'show'])->name('siswa.kegiatan.show');
    // Latihan soal (siswa)
    Route::get('/latihan', [App\Http\Controllers\Siswa\LatihanController::class, 'index'])->name('siswa.latihan.index');
    Route::get('/latihan/{id}', [App\Http\Controllers\Siswa\LatihanController::class, 'show'])->name('siswa.latihan.show');
    Route::post('/latihan/{id}/submit', [App\Http\Controllers\Siswa\LatihanController::class, 'submit'])->name('siswa.latihan.submit');
    Route::get('/latihan/{id}/hasil', [App\Http\Controllers\Siswa\LatihanController::class, 'hasil'])->name('siswa.latihan.hasil');
});

require __DIR__ . '/auth.php';
