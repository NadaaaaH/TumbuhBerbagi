<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Kegiatan;
use App\Models\PaketLatihan;
use App\Models\SesiLatihan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $siswa = auth()->user();

        // 1. Jadwal Terdekat (tanggal >= hari ini)
        $jadwalTerdekat = Jadwal::where('tanggal', '>=', now()->toDateString())
            ->where('status', 'aktif')
            ->orderBy('tanggal', 'asc')
            ->orderBy('waktu_mulai', 'asc')
            ->first();

        // 2. Kegiatan Terbaru (ambil 3 kegiatan terbaru)
        $kegiatanTerbaru = Kegiatan::orderBy('tanggal', 'desc')
            ->take(3)
            ->get();

        // 3. Latihan Soal yang Aktif (ambil 3 paket terbaru)
        $pakets = PaketLatihan::where('status', 'aktif')
            ->withCount(['soal' => function ($query) {
                $query->where('status', 'aktif');
            }])
            ->orderBy('id_paket', 'desc')
            ->take(3)
            ->get();

        $ongoingPackages = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('status', 'aktif')
            ->whereDoesntHave('hasil_latihan')
            ->pluck('id_paket')
            ->toArray();

        $completedSessions = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->whereHas('hasil_latihan')
            ->with('hasil_latihan')
            ->get()
            ->keyBy('id_paket');

        $latihanAktif = $pakets->map(function ($paket) use ($ongoingPackages, $completedSessions) {
            $status = 'belum_mulai';
            $nilai = null;

            if (in_array($paket->id_paket, $ongoingPackages)) {
                $status = 'sedang_dikerjakan';
            } elseif (isset($completedSessions[$paket->id_paket])) {
                $status = 'selesai';
                $nilai = $completedSessions[$paket->id_paket]->hasil_latihan->nilai_akhir;
            }

            return [
                'id_paket' => $paket->id_paket,
                'nama_paket' => $paket->nama_paket,
                'deskripsi' => $paket->deskripsi,
                'waktu_ujian' => $paket->waktu_ujian,
                'soal_count' => $paket->soal_count,
                'status' => $status,
                'nilai' => $nilai,
            ];
        });

        return Inertia::render('Dashboard', [
            'jadwalTerdekat' => $jadwalTerdekat,
            'kegiatanTerbaru' => $kegiatanTerbaru,
            'latihanAktif' => $latihanAktif,
        ]);
    }
}
