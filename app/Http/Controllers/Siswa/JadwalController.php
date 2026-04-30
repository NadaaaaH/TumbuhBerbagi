<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index()
    {
        // Siswa bisa melihat semua jadwal
        $jadwals = Jadwal::orderBy('tanggal', 'desc')->orderBy('waktu_mulai', 'desc')->get();
        return Inertia::render('Siswa/Jadwal/Index', [
            'jadwals' => $jadwals
        ]);
    }
}
