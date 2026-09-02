<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KegiatanPublikController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SiswaController as AdminSiswaController;
use App\Http\Controllers\Admin\JadwalController as AdminJadwalController;
use App\Http\Controllers\Admin\KegiatanController as AdminKegiatanController;
use App\Http\Controllers\Admin\SoalController as AdminSoalController;
use App\Http\Controllers\Admin\PaketLatihanController as AdminPaketLatihanController;
use App\Http\Controllers\Admin\SesiLatihanController as AdminSesiLatihanController;
use App\Http\Controllers\Siswa\DashboardController as SiswaDashboardController;
use App\Http\Controllers\Siswa\JadwalController as SiswaJadwalController;
use App\Http\Controllers\Siswa\KegiatanController as SiswaKegiatanController;
use App\Http\Controllers\Siswa\LatihanController as SiswaLatihanController;
use App\Http\Controllers\Siswa\NotificationController as SiswaNotificationController;
use App\Models\Kegiatan;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public route — accessible without login
Route::get('/kegiatan/{id}', [KegiatanPublikController::class, 'show'])->name('kegiatan.publik.show');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'kegiatans' => Kegiatan::orderBy('tanggal', 'desc')->take(6)->get(),
    ]);
});

Route::get('/dashboard', [SiswaDashboardController::class, 'index'])
    ->middleware(['auth:siswa', 'siswa.verified', 'siswa.password_changed'])
    ->name('dashboard');

// Admin Protected Routes
Route::middleware('auth:admin')->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::resource('admin/siswa', AdminSiswaController::class);
    Route::resource('admin/jadwal', AdminJadwalController::class);
    Route::resource('admin/kegiatan', AdminKegiatanController::class);
    Route::resource('admin/soal', AdminSoalController::class);
    
    Route::patch('admin/soal/{id}/toggle-status', [AdminSoalController::class, 'toggleStatus'])
        ->name('soal.toggleStatus');
        
    Route::resource('admin/paket-latihan', AdminPaketLatihanController::class)
        ->names('paket-latihan');
        
    Route::resource('admin/sesi-latihan', AdminSesiLatihanController::class)
        ->only(['index', 'show'])
        ->names('sesi-latihan');
        
    Route::get('admin/sesi-latihan/{id}/export-all', [AdminSesiLatihanController::class, 'exportAll'])
        ->name('sesi-latihan.export-all');
    Route::get('admin/sesi-latihan/{id_sesi}/export-siswa', [AdminSesiLatihanController::class, 'exportSiswa'])
        ->name('sesi-latihan.export-siswa');
    Route::get('admin/sesi-latihan/{id}/preview-all', [AdminSesiLatihanController::class, 'previewAll'])
        ->name('sesi-latihan.preview-all');
    Route::get('admin/sesi-latihan/{id_sesi}/preview-siswa', [AdminSesiLatihanController::class, 'previewSiswa'])
        ->name('sesi-latihan.preview-siswa');
});

// Siswa Protected Routes
Route::middleware(['auth:siswa', 'siswa.verified', 'siswa.password_changed'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    
    Route::get('/jadwal', [SiswaJadwalController::class, 'index'])->name('siswa.jadwal');
    Route::post('/jadwal/{id}/alarm', [SiswaJadwalController::class, 'toggleAlarm'])->name('siswa.jadwal.alarm');
    
    Route::get('/kegiatan', [SiswaKegiatanController::class, 'index'])->name('siswa.kegiatan.index');
    Route::get('/kegiatan/{id}', [SiswaKegiatanController::class, 'show'])->name('siswa.kegiatan.show');
    
    // Latihan soal (siswa)
    Route::get('/latihan', [SiswaLatihanController::class, 'index'])->name('siswa.latihan.index');
    Route::get('/latihan/{id}', [SiswaLatihanController::class, 'show'])->name('siswa.latihan.show');
    Route::post('/latihan/{id}/submit', [SiswaLatihanController::class, 'submit'])->name('siswa.latihan.submit');
    Route::get('/latihan/{id}/hasil', [SiswaLatihanController::class, 'hasil'])->name('siswa.latihan.hasil');

    // Notifikasi (siswa)
    Route::post('/notifications/read-all', [SiswaNotificationController::class, 'markAllAsRead'])->name('siswa.notifications.read-all');
    Route::post('/notifications/{id}/read', [SiswaNotificationController::class, 'markAsRead'])->name('siswa.notifications.read');
});

require __DIR__ . '/auth.php';

