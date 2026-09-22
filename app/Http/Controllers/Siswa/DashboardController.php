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

        // 1. Jadwals (Semua jadwal aktif untuk kalender)
        $jadwals = Jadwal::where('status', 'aktif')
            ->orderBy('tanggal', 'asc')
            ->orderBy('waktu_mulai', 'asc')
            ->get();

        // Jadwal Terdekat
        $jadwalTerdekat = Jadwal::where('tanggal', '>=', now()->toDateString())
            ->where('status', 'aktif')
            ->orderBy('tanggal', 'asc')
            ->orderBy('waktu_mulai', 'asc')
            ->first();

        // 2. Kegiatan Terbaru (ambil 3 kegiatan terbaru)
        $kegiatanTerbaru = Kegiatan::orderBy('tanggal', 'desc')
            ->take(3)
            ->get();

        // 3. Statistik (Indicators)
        // Ambil sesi yang sudah selesai beserta relasi paket_latihan dan hasil_latihan
        $completedSessions = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->whereHas('hasil_latihan')
            ->with(['hasil_latihan', 'paket_latihan'])
            ->get();

        $totalLatsolDikerjakan = 0;
        $totalTryoutDikerjakan = 0;
        $skorTerbesarTO = null;

        foreach ($completedSessions as $session) {
            if ($session->paket_latihan) {
                if ($session->paket_latihan->tipe === 'tryout') {
                    $totalTryoutDikerjakan++;
                    $nilaiAkhir = $session->hasil_latihan->nilai_akhir;
                    if ($skorTerbesarTO === null || $nilaiAkhir > $skorTerbesarTO) {
                        $skorTerbesarTO = $nilaiAkhir;
                    }
                } else {
                    $totalLatsolDikerjakan++;
                }
            }
        }

        // 4. Latihan Aktif (Belum Selesai)
        $completedPackageIds = $completedSessions->pluck('id_paket')->toArray();

        $ongoingPackages = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('status', 'aktif')
            ->whereDoesntHave('hasil_latihan')
            ->pluck('id_paket')
            ->toArray();

        $pakets = PaketLatihan::where('status', 'aktif')
            ->whereNotIn('id_paket', $completedPackageIds)
            ->withCount(['soal' => function ($query) {
                $query->where('status', 'aktif');
            }])
            ->orderBy('id_paket', 'desc')
            ->take(15)
            ->get();

        $latihanAktif = $pakets->map(function ($paket) use ($ongoingPackages) {
            $status = 'belum_mulai';
            if (in_array($paket->id_paket, $ongoingPackages)) {
                $status = 'sedang_dikerjakan';
            }

            return [
                'id_paket' => $paket->id_paket,
                'nama_paket' => $paket->nama_paket,
                'deskripsi' => $paket->deskripsi,
                'waktu_ujian' => $paket->waktu_ujian,
                'soal_count' => $paket->soal_count,
                'status' => $status,
                'tipe' => $paket->tipe ?? 'latihan',
                'nilai' => null,
            ];
        });

        return Inertia::render('Siswa/Dashboard', [
            'jadwals' => $jadwals,
            'jadwalTerdekat' => $jadwalTerdekat,
            'kegiatanTerbaru' => $kegiatanTerbaru,
            'latihanAktif' => $latihanAktif,
            'totalLatsolDikerjakan' => $totalLatsolDikerjakan,
            'totalTryoutDikerjakan' => $totalTryoutDikerjakan,
            'skorTerbesarTO' => $skorTerbesarTO,
        ]);
    }
}
