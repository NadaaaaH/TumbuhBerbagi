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

        // 2. Kegiatan Terbaru (ambil 2 kegiatan terbaru, yang ke-1 akan ditampilkan lebih besar)
        $kegiatanTerbaru = Kegiatan::orderBy('tanggal', 'desc')
            ->take(2)
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
            ->where(function ($q) {
                $q->whereNull('tanggal_aktif')
                  ->orWhere('tanggal_aktif', '<=', now());
            })
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

            $waktu_ujian = $paket->waktu_ujian;
            if ($paket->tipe === 'tryout') {
                $subtesList = $paket->soal()->select('subtes')->distinct()->pluck('subtes')->toArray();
                $waktu_ujian = 0;
                foreach ($subtesList as $s) {
                    if (isset(\App\Models\PaketLatihan::SUBTES_UTBK[$s])) {
                        $waktu_ujian += \App\Models\PaketLatihan::SUBTES_UTBK[$s]['durasi_menit'];
                    }
                }
            }

            return [
                'id_paket' => $paket->id_paket,
                'nama_paket' => $paket->nama_paket,
                'deskripsi' => $paket->deskripsi,
                'waktu_ujian' => $waktu_ujian,
                'soal_count' => $paket->soal_count,
                'status' => $status,
                'tipe' => $paket->tipe ?? 'latihan',
                'nilai' => null,
            ];
        });

        // 5. Riwayat Dikerjakan — hanya paket aktif, reuse $completedSessions, sort terbaru dulu
        $riwayatDikerjakan = $completedSessions
            ->filter(fn($sesi) => $sesi->paket_latihan !== null && $sesi->paket_latihan->status === 'aktif')
            ->sortByDesc('id_sesi')
            ->take(20)
            ->map(function ($sesi) {
                return [
                    'id_sesi'     => $sesi->id_sesi,
                    'id_paket'    => $sesi->id_paket,
                    'nama_paket'  => $sesi->paket_latihan->nama_paket ?? '-',
                    'tipe'        => $sesi->paket_latihan->tipe ?? 'latihan',
                    'nilai_akhir' => $sesi->hasil_latihan->nilai_akhir ?? null,
                ];
            })
            ->values();

        // 6. Statistik Nilai TO — filter tryout saja, urut dari yang lama (id_sesi asc)
        $statistikNilaiTO = $completedSessions
            ->filter(fn($sesi) => $sesi->paket_latihan && $sesi->paket_latihan->tipe === 'tryout')
            ->sortBy('id_sesi')
            ->map(function ($sesi) {
                return [
                    'label'   => $sesi->paket_latihan->nama_paket ?? 'TO',
                    'nilai'   => $sesi->hasil_latihan->nilai_akhir ?? 0,
                    'tanggal' => optional($sesi->waktu_selesai)->format('d/m') ?? '-',
                ];
            })
            ->values();

        return Inertia::render('Siswa/Dashboard', [
            'jadwals'              => $jadwals,
            'jadwalTerdekat'       => $jadwalTerdekat,
            'kegiatanTerbaru'      => $kegiatanTerbaru,
            'latihanAktif'         => $latihanAktif,
            'totalLatsolDikerjakan'=> $totalLatsolDikerjakan,
            'totalTryoutDikerjakan'=> $totalTryoutDikerjakan,
            'skorTerbesarTO'       => $skorTerbesarTO,
            'riwayatDikerjakan'    => $riwayatDikerjakan,
            'statistikNilaiTO'     => $statistikNilaiTO,
        ]);
    }
}
