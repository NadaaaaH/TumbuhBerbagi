<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Siswa;
use App\Models\Soal;
use App\Models\SesiLatihan;
use App\Models\StatistikPengunjung;
use App\Models\AktivitasSiswa;
use App\Models\PaketLatihan;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = Siswa::count();
        $totalJadwals = Jadwal::count();
        $totalLatihanSoal = Soal::count();
        $totalSesiLatihan = SesiLatihan::count();

        $tingkatAktivitas = $totalUsers > 0
            ? min(100, (int) round(($totalSesiLatihan / $totalUsers) * 100))
            : 0;
        $realData = StatistikPengunjung::where('tanggal', '>=', now()->subDays(6)->toDateString())
            ->orderBy('tanggal', 'asc')
            ->get()
            ->keyBy('tanggal');

        $chartData = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $chartData->push([
                'tanggal' => $date,
                'jumlah_siswa' => $realData->has($date) ? $realData[$date]->jumlah_siswa : 0,
                'jumlah_tamu' => $realData->has($date) ? $realData[$date]->jumlah_tamu : 0,
            ]);
        }
        $notifications = AktivitasSiswa::with('siswa:id_siswa,nama,email')
            ->orderBy('created_at', 'desc')
            ->take(30)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id_aktivitas,
                    'siswa' => $item->siswa ? $item->siswa->nama : 'Siswa Terhapus',
                    'tipe' => $item->tipe_aktivitas,
                    'deskripsi' => $item->deskripsi,
                    'waktu' => $item->created_at->diffForHumans(),
                ];
            });

        $activePackages = PaketLatihan::where('status', 'aktif')
            ->withCount('soal')
            ->orderBy('id_paket', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalJadwals' => $totalJadwals,
                'totalLatihanSoal' => $totalLatihanSoal,
                'tingkatAktivitas' => $tingkatAktivitas,
            ],
            'chartData' => $chartData,
            'notifications' => $notifications,
            'activePackages' => $activePackages,
        ]);
    }

}
