<?php

namespace App\Services\Admin;

use App\Models\AktivitasSiswa;
use App\Models\HasilLatihan;
use App\Models\Jadwal;
use App\Models\JawabanSiswa;
use App\Models\PaketLatihan;
use App\Models\SesiLatihan;
use App\Models\Siswa;
use App\Models\Soal;
use App\Models\StatistikPengunjung;
use App\Http\Controllers\Siswa\TryoutController;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Kumpulkan seluruh data agregasi dashboard dari database nyata.
     */
    public function getOverview(): array
    {
        return [
            'metrics'           => $this->getMetrics(),
            'learningActivity'  => $this->getLearningActivity(),
            'academicOverview'  => $this->getAcademicOverview(),
            'upcomingSchedules' => $this->getUpcomingSchedules(),
            'recentPackages'    => $this->getRecentPackages(),
            'needsAttention'    => $this->getNeedsAttention(),
            'problemQuestions'  => $this->getProblemQuestions(),
            'recentActivities'  => $this->getRecentActivities(),
            'visitorSummary'    => $this->getVisitorSummary(),
        ];
    }

    /**
     * SECTION 2 - OVERVIEW METRICS
     * 1. Total Siswa
     * 2. Siswa Aktif (7 hari terakhir)
     * 3. Tryout Aktif
     * 4. Aktivitas Pembelajaran Hari Ini
     * 5. Akses Website Hari Ini (Total, Siswa, Tamu)
     */
    public function getMetrics(): array
    {
        $today = now()->toDateString();
        $sevenDaysAgo = now()->subDays(7)->startOfDay();

        // 1. Total siswa terdaftar
        $totalSiswa = Siswa::count();

        // 2. Siswa aktif 7 hari terakhir (distinct siswa yang memiliki sesi latihan atau aktivitas login/latihan)
        $activeFromSessions = SesiLatihan::where('waktu_mulai', '>=', $sevenDaysAgo)
            ->whereNotNull('id_siswa')
            ->distinct()
            ->pluck('id_siswa');

        $activeFromActivities = AktivitasSiswa::where('created_at', '>=', $sevenDaysAgo)
            ->whereNotNull('id_siswa')
            ->distinct()
            ->pluck('id_siswa');

        $siswaAktif = $activeFromSessions->concat($activeFromActivities)->unique()->count();

        // Trend siswa aktif 7 hari lalu vs 8-14 hari lalu
        $fourteenDaysAgo = now()->subDays(14)->startOfDay();
        $prevFromSessions = SesiLatihan::where('waktu_mulai', '>=', $fourteenDaysAgo)
            ->where('waktu_mulai', '<', $sevenDaysAgo)
            ->whereNotNull('id_siswa')
            ->distinct()
            ->pluck('id_siswa');
        $prevFromActivities = AktivitasSiswa::where('created_at', '>=', $fourteenDaysAgo)
            ->where('created_at', '<', $sevenDaysAgo)
            ->whereNotNull('id_siswa')
            ->distinct()
            ->pluck('id_siswa');
        $prevSiswaAktif = $prevFromSessions->concat($prevFromActivities)->unique()->count();
        $siswaAktifDiff = $siswaAktif - $prevSiswaAktif;

        // 3. Tryout yang sedang aktif
        $tryoutAktif = PaketLatihan::where('tipe', 'tryout')
            ->where('status', 'aktif')
            ->where(function ($q) {
                $q->whereNull('tanggal_mulai')
                    ->orWhere('tanggal_mulai', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('tanggal_selesai')
                    ->orWhere('tanggal_selesai', '>=', now());
            })
            ->count();

        // 4. Aktivitas pembelajaran hari ini (sesi latihan dimulai hari ini + aktivitas pengerjaan)
        $sesiHariIni = SesiLatihan::whereDate('waktu_mulai', $today)->count();
        $aktivitasHariIni = $sesiHariIni;
        if ($aktivitasHariIni === 0) {
            $aktivitasHariIni = AktivitasSiswa::whereDate('created_at', $today)
                ->where('tipe_aktivitas', '!=', 'login')
                ->count();
        }

        // 5. Akses website hari ini (dari visitor tracking StatistikPengunjung)
        $visitorSummary = $this->getVisitorSummary();

        return [
            'total_siswa'          => $totalSiswa,
            'siswa_aktif'          => $siswaAktif,
            'siswa_aktif_diff'     => $siswaAktifDiff,
            'tryout_aktif'         => $tryoutAktif,
            'aktivitas_hari_ini'   => $aktivitasHariIni,
            'akses_hari_ini'       => [
                'total' => $visitorSummary['today_total'],
                'siswa' => $visitorSummary['today_siswa'],
                'tamu'  => $visitorSummary['today_tamu'],
            ],
        ];
    }

    /**
     * SECTION 3 & VISITOR ACCESS - Visitor Summary
     * Membedakan Siswa (authenticated) dan Tamu (anonymous)
     */
    public function getVisitorSummary(): array
    {
        $today = now()->toDateString();
        $todayStats = StatistikPengunjung::where('tanggal', $today)->first();

        $siswa = $todayStats ? (int) $todayStats->jumlah_siswa : 0;
        $tamu = $todayStats ? (int) $todayStats->jumlah_tamu : 0;
        $total = $siswa + $tamu;

        return [
            'today_total' => $total,
            'today_siswa' => $siswa,
            'today_tamu'  => $tamu,
        ];
    }

    /**
     * SECTION 4 - LEARNING ACTIVITY
     * Agregasi database per hari (date, latsol, tryout, total).
     * Mendukung rentang 7 hari dan 30 hari.
     */
    public function getLearningActivity(): array
    {
        return [
            '7d'  => $this->getLearningActivityForDays(7),
            '30d' => $this->getLearningActivityForDays(30),
        ];
    }

    public function getLearningActivityForDays(int $days = 7): array
    {
        $startDate = now()->subDays($days - 1)->startOfDay();

        // Agregasi di database level (PostgreSQL compliant menggunakan CAST AS DATE)
        $rawData = DB::table('sesi_latihan')
            ->join('paket_latihan', 'sesi_latihan.id_paket', '=', 'paket_latihan.id_paket')
            ->where('sesi_latihan.waktu_mulai', '>=', $startDate)
            ->whereNotNull('sesi_latihan.waktu_mulai')
            ->selectRaw("
                CAST(sesi_latihan.waktu_mulai AS DATE) as tanggal,
                paket_latihan.tipe,
                COUNT(*) as jumlah
            ")
            ->groupByRaw("CAST(sesi_latihan.waktu_mulai AS DATE), paket_latihan.tipe")
            ->orderBy('tanggal', 'asc')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->tanggal)->toDateString();
            });

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $dayData = $rawData->get($date, collect());

            $latsol = 0;
            $tryout = 0;
            foreach ($dayData as $row) {
                if ($row->tipe === 'tryout') {
                    $tryout += (int) $row->jumlah;
                } else {
                    $latsol += (int) $row->jumlah;
                }
            }

            $result[] = [
                'date'   => $date,
                'label'  => Carbon::parse($date)->locale('id')->isoFormat('D MMM'),
                'latsol' => $latsol,
                'tryout' => $tryout,
                'total'  => $latsol + $tryout,
            ];
        }

        return $result;
    }

    /**
     * SECTION 5 - ACADEMIC OVERVIEW
     * Mengambil tryout terbaru, average score, average accuracy, dan participants
     * dari tabel hasil_latihan & sesi_latihan yang telah diselesaikan.
     */
    public function getAcademicOverview(): array
    {
        // 1. Cari tryout terbaru yang sudah memiliki sesi latihan berstatus selesai
        $latestTryout = PaketLatihan::where('tipe', 'tryout')
            ->whereHas('sesi_latihan', function ($q) {
                $q->where('status', 'selesai');
            })
            ->orderBy('id_paket', 'desc')
            ->first();

        // Jika belum ada sesi selesai pada tryout, cari tryout aktif terbaru
        if (!$latestTryout) {
            $latestTryout = PaketLatihan::where('tipe', 'tryout')
                ->orderBy('id_paket', 'desc')
                ->first();
        }

        if (!$latestTryout) {
            return [
                'has_data'        => false,
                'tryout_nama'     => null,
                'avg_score'       => 0,
                'avg_accuracy'    => 0,
                'participants'    => 0,
                'submission_rate' => '0%',
                'highest'         => 0,
                'lowest'          => 0,
            ];
        }

        // Agregasi nilai_akhir, akurasi, dan jumlah peserta dari database
        $hasilStats = DB::table('hasil_latihan')
            ->join('sesi_latihan', 'hasil_latihan.id_sesi', '=', 'sesi_latihan.id_sesi')
            ->where('sesi_latihan.id_paket', $latestTryout->id_paket)
            ->where('sesi_latihan.status', 'selesai')
            ->selectRaw('
                COUNT(*) as participants,
                AVG(hasil_latihan.nilai_akhir) as avg_score,
                MAX(hasil_latihan.nilai_akhir) as highest,
                MIN(hasil_latihan.nilai_akhir) as lowest,
                AVG(CASE WHEN hasil_latihan.total_soal > 0
                    THEN (CAST(hasil_latihan.jumlah_benar AS FLOAT) / hasil_latihan.total_soal * 100)
                    ELSE 0 END) as avg_accuracy
            ')
            ->first();

        $totalSesi = SesiLatihan::where('id_paket', $latestTryout->id_paket)->count();
        $completedParticipants = $hasilStats ? (int) $hasilStats->participants : 0;
        $submissionRate = $totalSesi > 0
            ? round(($completedParticipants / $totalSesi) * 100, 1) . '%'
            : '100%';

        $hasCompletedData = $completedParticipants > 0;

        return [
            'has_data'        => $hasCompletedData,
            'tryout_nama'     => $latestTryout->nama_paket,
            'tanggal_mulai'   => $latestTryout->tanggal_mulai ? $latestTryout->tanggal_mulai->format('d M Y') : null,
            'status'          => $latestTryout->status,
            'avg_score'       => $hasilStats && $hasilStats->avg_score !== null ? round((float) $hasilStats->avg_score, 1) : 0,
            'avg_accuracy'    => $hasilStats && $hasilStats->avg_accuracy !== null ? round((float) $hasilStats->avg_accuracy, 1) : 0,
            'participants'    => $completedParticipants,
            'submission_rate' => $submissionRate,
            'highest'         => $hasilStats && $hasilStats->highest !== null ? round((float) $hasilStats->highest, 1) : 0,
            'lowest'          => $hasilStats && $hasilStats->lowest !== null ? round((float) $hasilStats->lowest, 1) : 0,
        ];
    }

    /**
     * SECTION 6 - UPCOMING SCHEDULE
     * Jadwal mentoring terdekat dengan prioritas:
     * 1. Hari ini
     * 2. Besok
     * 3. Jadwal mendatang terdekat
     */
    public function getUpcomingSchedules(): array
    {
        $today = now()->toDateString();
        $nowTime = now()->format('H:i:s');

        // Ambil jadwal yang belum berakhir (hari ini atau masa mendatang)
        $jadwals = Jadwal::where('tanggal', '>=', $today)
            ->where(function ($q) use ($today, $nowTime) {
                $q->where('tanggal', '>', $today)
                    ->orWhere(function ($sub) use ($today, $nowTime) {
                        $sub->where('tanggal', $today)
                            ->where(function ($timeSub) use ($nowTime) {
                                $timeSub->where('waktu_selesai', '>=', $nowTime)
                                    ->orWhereNull('waktu_selesai');
                            });
                    });
            })
            ->orderBy('tanggal', 'asc')
            ->orderBy('waktu_mulai', 'asc')
            ->take(5)
            ->get();

        return $jadwals->map(function ($jadwal) {
            $tanggal = Carbon::parse($jadwal->tanggal);
            $todayCarbon = now()->startOfDay();

            if ($tanggal->isSameDay($todayCarbon)) {
                $labelHari = 'Hari ini';
            } elseif ($tanggal->isSameDay($todayCarbon->copy()->addDay())) {
                $labelHari = 'Besok';
            } else {
                $labelHari = $tanggal->locale('id')->isoFormat('dddd, D MMM');
            }

            return [
                'id_jadwal'     => $jadwal->id_jadwal,
                'nama_jadwal'   => $jadwal->nama_jadwal,
                'tanggal'       => $jadwal->tanggal,
                'label_hari'    => $labelHari,
                'waktu_mulai'   => $jadwal->waktu_mulai ? substr($jadwal->waktu_mulai, 0, 5) : null,
                'waktu_selesai' => $jadwal->waktu_selesai ? substr($jadwal->waktu_selesai, 0, 5) : null,
                'lokasi'        => $jadwal->lokasi,
                'status'        => $jadwal->status, // Accessor dynamic status
                'gambar_url'    => $jadwal->gambar_url,
            ];
        })->toArray();
    }

    /**
     * SECTION 7 - RECENT PACKAGES
     * Mengambil paket latihan dan tryout terbaru beserta total peserta dan soal
     */
    public function getRecentPackages(): array
    {
        $pakets = PaketLatihan::withCount(['sesi_latihan as participants_count', 'soal as soal_count'])
            ->orderBy('id_paket', 'desc')
            ->take(6)
            ->get();

        return $pakets->map(function ($paket) {
            $isTryout = $paket->tipe === 'tryout';

            $durasi = 'Fleksibel';
            if ($paket->waktu_ujian) {
                $durasi = "{$paket->waktu_ujian} Menit";
            } elseif ($isTryout) {
                $durasi = '195 Menit';
            }

            return [
                'id_paket'      => $paket->id_paket,
                'nama_paket'    => $paket->nama_paket,
                'tipe'          => $paket->tipe ?? 'latihan',
                'tipe_label'    => $isTryout ? 'Tryout' : 'Latsol',
                'status'        => $paket->status ?? 'aktif',
                'participants'  => (int) $paket->participants_count,
                'soal_count'    => (int) $paket->soal_count,
                'duration'      => $durasi,
            ];
        })->toArray();
    }

    /**
     * SECTION 8 - NEEDS ATTENTION
     * Deteksi anomali / masalah nyata dari database:
     * 1. Soal aktif dengan akurasi kritis (< 25%)
     * 2. Paket aktif tanpa butir soal
     * 3. Soal aktif tanpa penjelasan/pembahasan
     * 4. Tryout aktif dengan percobaan tidak selesai (incomplete attempts)
     * 5. Jadwal mentoring yang akan segera dimulai (dalam 2 jam ke depan)
     */
    public function getNeedsAttention(): array
    {
        $items = [];

        // 1. Soal aktif dengan akurasi rendah (< 25%, min 3 attempts)
        $soalBermasalah = DB::table('jawaban_siswa')
            ->join('soal', 'jawaban_siswa.id_soal', '=', 'soal.id_soal')
            ->where('soal.status', 'aktif')
            ->groupBy('jawaban_siswa.id_soal')
            ->havingRaw('COUNT(*) >= 3')
            ->havingRaw('CAST(SUM(CASE WHEN jawaban_siswa.is_benar THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) < 0.25')
            ->select('jawaban_siswa.id_soal')
            ->get()
            ->count();

        if ($soalBermasalah > 0) {
            $items[] = [
                'id'          => 'na-low-accuracy',
                'severity'    => 'danger',
                'title'       => "{$soalBermasalah} butir soal memiliki akurasi di bawah 25%",
                'description' => 'Akurasi pengerjaan siswa berada di bawah ambang batas minimal. Perlu evaluasi kunci jawaban atau tingkat kesulitan.',
                'actionLabel' => 'Tinjau Soal',
                'href'        => route('soal.index'),
            ];
        }

        // 2. Paket aktif tanpa soal
        $paketTanpaSoal = PaketLatihan::where('status', 'aktif')
            ->whereDoesntHave('soal')
            ->count();

        if ($paketTanpaSoal > 0) {
            $items[] = [
                'id'          => 'na-empty-package',
                'severity'    => 'danger',
                'title'       => "{$paketTanpaSoal} paket aktif belum memiliki butir soal",
                'description' => 'Paket berstatus aktif tidak dapat dikerjakan siswa karena belum memiliki butir soal yang dilampirkan.',
                'actionLabel' => 'Tambah Butir Soal',
                'href'        => route('paket-latihan.index'),
            ];
        }

        // 3. Soal aktif tanpa pembahasan
        $soalTanpaPembahasan = Soal::where('status', 'aktif')
            ->where(function ($q) {
                $q->whereNull('pembahasan')->orWhere('pembahasan', '');
            })
            ->count();

        if ($soalTanpaPembahasan > 0) {
            $items[] = [
                'id'          => 'na-no-explanation',
                'severity'    => 'info',
                'title'       => "{$soalTanpaPembahasan} soal aktif belum memiliki pembahasan",
                'description' => 'Siswa tidak dapat mempelajari materi solusi jika pembahasan belum dilengkapi oleh tutor/admin.',
                'actionLabel' => 'Lengkapi Pembahasan',
                'href'        => route('soal.index'),
            ];
        }

        // 4. Komposisi Butir Soal Try Out (Standar UTBK: 160 butir soal)
        // PU: 30, PPU: 20, PBM: 20, PK: 20, LBI: 30, LBIng: 20, PM: 20
        $standarTryout = [
            'PU'    => ['nama' => 'Penalaran Umum (PU)',                            'target' => 30],
            'PPU'   => ['nama' => 'Pengetahuan & Pemahaman Umum (PPU)',             'target' => 20],
            'PBM'   => ['nama' => 'Pemahaman Bacaan & Menulis (PBM)',               'target' => 20],
            'PK'    => ['nama' => 'Pengetahuan Kuantitatif (PK)',                   'target' => 20],
            'LBI'   => ['nama' => 'Literasi dalam Bahasa Indonesia (LBI)',          'target' => 30],
            'LBIng' => ['nama' => 'Literasi dalam Bahasa Inggris (LBIng)',          'target' => 20],
            'PM'    => ['nama' => 'Penalaran Matematika (PM)',                      'target' => 20],
        ];

        $tryouts = PaketLatihan::where('tipe', 'tryout')
            ->where('status', 'aktif')
            ->with(['soal' => function ($q) {
                $q->select('soal.id_soal', 'soal.kategori', 'soal.status');
            }])
            ->get();

        $tryoutBermasalah = [];
        foreach ($tryouts as $to) {
            $counts = [
                'PU' => 0, 'PPU' => 0, 'PBM' => 0, 'PK' => 0,
                'LBI' => 0, 'LBIng' => 0, 'PM' => 0,
            ];
            foreach ($to->soal as $s) {
                $sub = TryoutController::getSoalSubtesCode($s);
                if (isset($counts[$sub])) {
                    $counts[$sub]++;
                }
            }

            $mismatches = [];
            foreach ($standarTryout as $code => $std) {
                $actual = $counts[$code] ?? 0;
                if ($actual !== $std['target']) {
                    $diff = $actual - $std['target'];
                    $ket = $diff > 0 ? "+{$diff} butir (lebih)" : "{$diff} butir (kurang)";
                    $mismatches[] = "{$code}: {$actual}/{$std['target']} ({$ket})";
                }
            }

            if (!empty($mismatches)) {
                $tryoutBermasalah[] = [
                    'id_paket'   => $to->id_paket,
                    'nama_paket' => $to->nama_paket,
                    'total_soal' => $to->soal->count(),
                    'mismatches' => $mismatches,
                ];
            }
        }

        if (count($tryoutBermasalah) === 1) {
            $tb = $tryoutBermasalah[0];
            $items[] = [
                'id'          => 'na-tryout-composition-' . $tb['id_paket'],
                'severity'    => 'warning',
                'title'       => "Komposisi Soal \"{$tb['nama_paket']}\" Belum Sesuai",
                'description' => "Paket Try Out memiliki {$tb['total_soal']} soal (standar 160 butir). Rincian ketidaksesuaian: " . implode(', ', array_slice($tb['mismatches'], 0, 3)) . (count($tb['mismatches']) > 3 ? ', dll.' : '.'),
                'disclaimer'  => 'Standar resmi Try Out UTBK mewajibkan komposisi 160 butir soal: PU (30 soal), Pengetahuan dan Pemahaman Umum (20 soal), Pemahaman Bacaan dan Menulis (20 soal), Pengetahuan Kuantitatif (20 soal), Literasi dalam Bahasa Indonesia (30 soal), Literasi dalam Bahasa Inggris (20 soal), dan Penalaran Matematika (20 soal). Kelebihan atau kekurangan butir soal dapat memengaruhi akurasi durasi waktu ujian dan kalkulasi skor IRT siswa.',
                'actionLabel' => 'Kelola Paket Try Out',
                'href'        => route('paket-latihan.show', $tb['id_paket']),
            ];
        } elseif (count($tryoutBermasalah) > 1) {
            $totalPaket = count($tryoutBermasalah);
            $namaPaketList = collect($tryoutBermasalah)->pluck('nama_paket')->take(3)->implode(', ');
            $items[] = [
                'id'          => 'na-tryout-composition',
                'severity'    => 'warning',
                'title'       => "{$totalPaket} Paket Try Out Belum Sesuai Standar Komposisi UTBK",
                'description' => "Paket ({$namaPaketList}) memiliki jumlah butir soal per subtes yang lebih atau kurang dari ketentuan standar 160 butir soal.",
                'disclaimer'  => 'Standar resmi Try Out UTBK mewajibkan komposisi 160 butir soal: PU (30 soal), Pengetahuan dan Pemahaman Umum (20 soal), Pemahaman Bacaan dan Menulis (20 soal), Pengetahuan Kuantitatif (20 soal), Literasi dalam Bahasa Indonesia (30 soal), Literasi dalam Bahasa Inggris (20 soal), dan Penalaran Matematika (20 soal). Kelebihan atau kekurangan butir soal dapat memengaruhi akurasi durasi waktu ujian dan kalkulasi skor IRT siswa.',
                'actionLabel' => 'Tinjau Paket Try Out',
                'href'        => route('paket-tryout.index'),
            ];
        }

        // 5. Jadwal mentoring segera dimulai (hari ini dalam 2 jam ke depan)
        $jadwalSegera = Jadwal::where('tanggal', now()->toDateString())
            ->where('waktu_mulai', '>=', now()->format('H:i:s'))
            ->where('waktu_mulai', '<=', now()->addHours(2)->format('H:i:s'))
            ->count();

        if ($jadwalSegera > 0) {
            $items[] = [
                'id'          => 'na-schedule-soon',
                'severity'    => 'info',
                'title'       => "{$jadwalSegera} jadwal mentoring akan dimulai dalam 2 jam",
                'description' => 'Pastikan ruang zoom/gmeet dan materi mentoring sudah disiapkan oleh tutor.',
                'actionLabel' => 'Lihat Jadwal',
                'href'        => route('jadwal.index'),
            ];
        }

        return $items;
    }

    /**
     * SECTION 9 - PROBLEM QUESTIONS
     * Soal dengan accuracy terendah dihitung dari:
     * accuracy = correct answers / total attempts
     * Memakai threshold adaptif (default 30 attempts, fallback jika dataset belum mencapai 30).
     */
    public function getProblemQuestions(int $limit = 6, int $minAttempts = 30): array
    {
        $queryBuilder = function ($threshold) use ($limit) {
            return DB::table('jawaban_siswa')
                ->join('soal', 'jawaban_siswa.id_soal', '=', 'soal.id_soal')
                ->leftJoin('sesi_latihan', 'jawaban_siswa.id_sesi', '=', 'sesi_latihan.id_sesi')
                ->where('soal.status', 'aktif')
                ->groupBy(
                    'jawaban_siswa.id_soal',
                    'soal.konten_soal',
                    'soal.kategori',
                    'soal.tingkat_kesulitan',
                    'soal.tingkat_kesulitan_index'
                )
                ->havingRaw('COUNT(*) >= ?', [$threshold])
                ->selectRaw("
                    jawaban_siswa.id_soal,
                    soal.konten_soal,
                    soal.kategori,
                    soal.tingkat_kesulitan,
                    soal.tingkat_kesulitan_index,
                    COUNT(*) as total_attempts,
                    COUNT(DISTINCT sesi_latihan.id_siswa) as total_siswa,
                    SUM(CASE WHEN jawaban_siswa.is_benar THEN 1 ELSE 0 END) as total_benar,
                    ROUND(
                        CAST(SUM(CASE WHEN jawaban_siswa.is_benar THEN 1 ELSE 0 END) AS NUMERIC) / COUNT(*) * 100,
                        1
                    ) as accuracy_pct
                ")
                ->orderBy('accuracy_pct', 'asc')
                ->orderBy('total_attempts', 'desc')
                ->limit($limit)
                ->get();
        };

        // Coba dengan ambang batas awal (misal 30)
        $results = $queryBuilder($minAttempts);

        // Jika sampel database saat ini belum mencapai 30 attempts, turunkan bertahap (5, lalu 1)
        if ($results->count() < $limit && $minAttempts > 5) {
            $results = $queryBuilder(5);
        }
        if ($results->isEmpty()) {
            $results = $queryBuilder(1);
        }

        return $results->map(function ($row) {
            $preview = strip_tags($row->konten_soal ?? '');
            $cleanPreview = preg_replace('/\s+/', ' ', trim($preview));
            if (mb_strlen($cleanPreview) > 85) {
                $cleanPreview = mb_substr($cleanPreview, 0, 85) . '…';
            }

            return [
                'id_soal'                 => $row->id_soal,
                'title'                   => "Soal #{$row->id_soal}",
                'preview'                 => $cleanPreview ?: "Soal #{$row->id_soal}",
                'kategori'                => $row->kategori ?: 'General',
                'tingkat_kesulitan'       => $row->tingkat_kesulitan ? ucfirst($row->tingkat_kesulitan) : 'Sedang',
                'tingkat_kesulitan_index' => $row->tingkat_kesulitan_index,
                'total_attempts'          => (int) $row->total_attempts,
                'total_siswa'             => (int) ($row->total_siswa ?: $row->total_attempts),
                'accuracy_pct'            => (float) $row->accuracy_pct,
            ];
        })->toArray();
    }

    /**
     * SECTION 10 - RECENT ACTIVITY
     * Mengambil 5–10 log aktivitas nyata dari tabel aktivitas_siswa
     */
    public function getRecentActivities(int $limit = 8): array
    {
        return AktivitasSiswa::with('siswa:id_siswa,nama')
            ->orderBy('id_aktivitas', 'desc')
            ->take($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id'         => $item->id_aktivitas,
                    'nama_siswa' => $item->siswa?->nama ?? 'Pengguna',
                    'tipe'       => $item->tipe_aktivitas,
                    'deskripsi'  => $item->deskripsi,
                    'waktu'      => $item->created_at ? $item->created_at->diffForHumans() : 'Baru saja',
                    'waktu_raw'  => $item->created_at ? $item->created_at->toIso8601String() : null,
                ];
            })->toArray();
    }
}
