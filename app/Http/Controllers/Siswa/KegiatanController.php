<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    public function index()
    {
        // Menampilkan daftar semua kegiatan
        $kegiatans = Kegiatan::orderBy('tanggal', 'desc')->get();
        return Inertia::render('Siswa/Kegiatan/Index', [
            'kegiatans' => $kegiatans
        ]);
    }

    public function show(string $id)
    {
        // Menampilkan detail spesifik satu kegiatan
        $kegiatan = Kegiatan::findOrFail($id);
        return Inertia::render('Siswa/Kegiatan/Show', [
            'kegiatan' => $kegiatan
        ]);
    }
}
