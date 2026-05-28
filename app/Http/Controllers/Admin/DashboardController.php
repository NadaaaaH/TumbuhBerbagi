<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Siswa;
use App\Models\Soal;
use App\Models\SesiLatihan;
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

        return Inertia::render('AdminDashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalJadwals' => $totalJadwals,
                'totalLatihanSoal' => $totalLatihanSoal,
                'tingkatAktivitas' => $tingkatAktivitas,
            ],
        ]);
    }

}
