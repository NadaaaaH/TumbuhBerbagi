<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\HasilLatihan;
use App\Models\JawabanSiswa;
use App\Models\PaketLatihan;
use App\Models\PilihanJawaban;
use App\Models\SesiLatihan;
use App\Models\Soal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TryoutController extends Controller
{
    protected const ORDER_TPS = ['PU', 'PPU', 'PBM', 'PK'];
    protected const ORDER_LITERASI = ['LBI', 'LBIng', 'PM'];
    protected const ORDER_SUBTES = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBIng', 'PM'];

    public function index()
    {
        $siswa = auth()->user();

        // Cek dan sinkronkan sesi aktif yang mungkin sudah habis seluruh waktunya saat user offline
        $activeSessions = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('status', 'aktif')
            ->whereDoesntHave('hasil_latihan')
            ->with('paket_latihan')
            ->get();

        foreach ($activeSessions as $activeSesi) {
            $p = $activeSesi->paket_latihan;
            if ($p && $p->tipe === 'tryout') {
                $subCodes = $this->getPaketSubtestCodes($p, $activeSesi);
                $timeline = $this->syncSesiTimeline($activeSesi, $p, $subCodes);
                if ($timeline['completed']) {
                    $this->executeFinalSubmit($activeSesi, $p);
                }
            }
        }

        $pakets = PaketLatihan::where(function ($q) {
                $q->where('status', 'aktif')
                  ->orWhere(function ($sub) {
                      $sub->whereNotNull('tanggal_aktif')
                          ->where('tanggal_aktif', '<=', now());
                  });
            })
            ->where(function ($q) {
                $q->whereNull('tanggal_aktif')
                  ->orWhere('tanggal_aktif', '<=', now());
            })
            ->where('tipe', 'tryout')
            ->withCount(['soal' => function ($query) {
                $query->where('status', 'aktif');
            }])
            ->orderBy('id_paket', 'desc')
            ->get();

        $pakets->transform(function ($p) {
            if (!$p->waktu_ujian || $p->waktu_ujian <= 0) {
                $p->waktu_ujian = 195;
            }
            return $p;
        });

        $ongoingPackages = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('status', 'aktif')
            ->whereDoesntHave('hasil_latihan')
            ->pluck('id_paket')
            ->toArray();

        $completedPackages = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->whereHas('hasil_latihan')
            ->with('hasil_latihan')
            ->get()
            ->mapWithKeys(function ($sesi) {
                return [$sesi->id_paket => $sesi->hasil_latihan->nilai_akhir];
            })
            ->toArray();

        return Inertia::render('Siswa/Tryout/Index', [
            'pakets' => $pakets,
            'ongoingPackages' => $ongoingPackages,
            'completedPackages' => $completedPackages,
        ]);
    }

    public function show(string $id)
    {
        $siswa = auth()->user();

        $paket = PaketLatihan::where('id_paket', $id)
            ->where(function ($q) {
                $q->where('status', 'aktif')
                  ->orWhere(function ($sub) {
                      $sub->whereNotNull('tanggal_aktif')
                          ->where('tanggal_aktif', '<=', now());
                  });
            })
            ->where(function ($q) {
                $q->whereNull('tanggal_aktif')
                  ->orWhere('tanggal_aktif', '<=', now());
            })
            ->where('tipe', 'tryout')
            ->with(['soal' => function ($query) {
                $query->where('status', 'aktif')
                      ->orderBy('id_soal', 'asc')
                      ->with('pilihan_jawaban');
            }])
            ->firstOrFail();

        // Validasi Periode Akses
        $now = now();
        if ($paket->tanggal_mulai && $now->lt($paket->tanggal_mulai)) {
            return redirect()->route('siswa.tryout.index')
                ->with('error', 'Try Out belum dibuka. Akses dimulai pada ' . $paket->tanggal_mulai->translatedFormat('d M Y H:i') . ' WIB.');
        }
        if ($paket->tanggal_selesai && $now->gt($paket->tanggal_selesai)) {
            return redirect()->route('siswa.tryout.index')
                ->with('error', 'Periode pengerjaan Try Out sudah berakhir.');
        }

        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('id_paket', $paket->id_paket)
            ->first();

        // Tentukan urutan subtes (dengan seed konsisten per sesi jika acak)
        $subtestCodes = $this->getPaketSubtestCodes($paket, $sesi);
        $firstCode = $subtestCodes[0] ?? 'PU';

        if (!$sesi) {
            $sesi = SesiLatihan::create([
                'id_siswa' => $siswa->id_siswa,
                'id_paket' => $paket->id_paket,
                'waktu_mulai' => now(),
                'status' => 'aktif',
                'subtes_aktif' => $firstCode,
                'waktu_mulai_subtes' => now(),
                'subtes_selesai' => [],
                'is_paused' => false,
                'sisa_detik_subtes' => PaketLatihan::SUBTES_UTBK[$firstCode]['durasi_detik'] ?? 1800,
            ]);

            // Jika acak, generate ulang subtestCodes dengan ID sesi yang baru tercipta sebagai seed
            if ($paket->is_random) {
                $subtestCodes = $this->getPaketSubtestCodes($paket, $sesi);
                $firstCode = $subtestCodes[0] ?? 'PU';
                $sesi->update([
                    'subtes_aktif' => $firstCode,
                    'sisa_detik_subtes' => PaketLatihan::SUBTES_UTBK[$firstCode]['durasi_detik'] ?? 1800,
                ]);
            }

            \App\Models\AktivitasSiswa::log('mulai_tryout', 'Siswa memulai Try Out ' . $paket->nama_paket);
        }

        if ($sesi->hasil_latihan || $sesi->status === 'selesai') {
            return redirect()->route('siswa.tryout.hasil', $paket->id_paket);
        }

        // Sinkronisasi timeline sesi:
        // Jika user menutup tab / offline, waktu nyata di server tetap berjalan (jika tidak di-pause).
        // Waktu berlebih akan memotong subtes-subtes berikutnya secara cascade atau auto-submit jika habis total.
        $timeline = $this->syncSesiTimeline($sesi, $paket, $subtestCodes);
        if ($timeline['completed']) {
            return $this->executeFinalSubmit($sesi, $paket);
        }

        $sisaDetik = $timeline['sisa_detik'];
        $activeCode = $sesi->subtes_aktif;
        $infoActive = PaketLatihan::SUBTES_UTBK[$activeCode] ?? [
            'kode' => $activeCode,
            'nama' => $activeCode,
            'durasi_menit' => 30,
            'durasi_detik' => 1800,
        ];
        $totalDurasiDetik = $infoActive['durasi_detik'];

        // Daftar Subtes untuk Tab Navigasi Header
        $subtesList = collect($subtestCodes)->map(function ($code) use ($sesi, $paket) {
            $info = PaketLatihan::SUBTES_UTBK[$code] ?? [
                'kode' => $code,
                'nama' => $code,
                'durasi_menit' => 30,
                'durasi_detik' => 1800,
            ];
            $soalCount = $paket->soal->filter(fn($s) => self::getSoalSubtesCode($s) === $code)->count();
            $isSelesai = in_array($code, $sesi->subtes_selesai ?? []);
            $isAktif = $sesi->subtes_aktif === $code;

            return [
                'kode' => $code,
                'nama' => $info['nama'],
                'durasi_menit' => $info['durasi_menit'],
                'durasi_detik' => $info['durasi_detik'],
                'soal_count' => $soalCount,
                'status' => $isSelesai ? 'selesai' : ($isAktif ? 'aktif' : 'terkunci'),
            ];
        })->values()->all();

        // Soal khusus subtes aktif
        $activeSoals = $paket->soal->filter(function ($s) use ($activeCode) {
            return self::getSoalSubtesCode($s) === $activeCode;
        })->values();

        // Acak soal jika is_random diaktifkan (konsisten per sesi)
        if ($paket->is_random) {
            $seed = (int) ($sesi->id_sesi . crc32($activeCode));
            mt_srand($seed);
            $items = $activeSoals->all();
            for ($i = count($items) - 1; $i > 0; $i--) {
                $j = mt_rand(0, $i);
                $tmp = $items[$i];
                $items[$i] = $items[$j];
                $items[$j] = $tmp;
            }
            $activeSoals = collect($items);
        }

        // Jawaban yang sudah tersimpan di database
        $savedJawaban = JawabanSiswa::where('id_sesi', $sesi->id_sesi)
            ->get()
            ->mapWithKeys(function ($j) {
                return [$j->id_soal => $j->id_pilihan ?: $j->teks_jawaban];
            })
            ->all();

        // Cek apakah subtes aktif adalah subtes terakhir
        $subtesSelesai = $sesi->subtes_selesai ?? [];
        $remainingAfterActive = array_values(array_diff($subtestCodes, array_merge($subtesSelesai, [$activeCode])));
        $isLastSubtest = empty($remainingAfterActive);

        return Inertia::render('Siswa/Tryout/Show', [
            'paket' => $paket,
            'sesi' => $sesi,
            'subtesList' => $subtesList,
            'activeSubtes' => [
                'kode' => $activeCode,
                'nama' => $infoActive['nama'],
                'durasi_detik' => $totalDurasiDetik,
                'sisa_detik' => $sisaDetik,
                'is_last' => $isLastSubtest,
                'is_intermisi' => (bool) ($timeline['is_intermisi'] ?? false),
                'sisa_jeda' => (int) ($timeline['sisa_jeda'] ?? 0),
            ],
            'soals' => $activeSoals,
            'savedJawaban' => $savedJawaban,
            'bisaPause' => (bool) $paket->bisa_pause,
            'isPaused' => (bool) $sesi->is_paused,
        ]);
    }

    public function saveJawaban(Request $request, string $id)
    {
        $siswa = auth()->user();
        $paket = PaketLatihan::where('id_paket', $id)->where('status', 'aktif')->where('tipe', 'tryout')->firstOrFail();
        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)->where('id_paket', $paket->id_paket)->where('status', 'aktif')->firstOrFail();

        if ($sesi->hasil_latihan || $sesi->status === 'selesai') {
            return response()->json(['error' => 'Try Out sudah selesai.', 'completed' => true], 403);
        }

        $subtestCodes = $this->getPaketSubtestCodes($paket, $sesi);
        $timeline = $this->syncSesiTimeline($sesi, $paket, $subtestCodes);
        if ($timeline['completed']) {
            $this->executeFinalSubmit($sesi, $paket);
            return response()->json(['error' => 'Waktu pengerjaan try out telah habis.', 'completed' => true], 403);
        }

        $validated = $request->validate([
            'id_soal' => 'required|exists:soal,id_soal',
            'jawaban' => 'nullable',
        ]);

        $soal = Soal::with('pilihan_jawaban')->findOrFail($validated['id_soal']);
        $val = $validated['jawaban'];

        $selectedPilihanId = null;
        $teksJawaban = null;
        $isBenar = false;

        if ($soal->jenis_soal === 'pilihan_ganda') {
            if ($val) {
                $pilihan = PilihanJawaban::where('id_pilihan', $val)->where('id_soal', $soal->id_soal)->first();
                if ($pilihan) {
                    $selectedPilihanId = $pilihan->id_pilihan;
                    $isBenar = strtoupper(trim($pilihan->kode_pilihan)) === strtoupper(trim($soal->kunci_jawaban));
                }
            }
        } else {
            $teksJawaban = trim((string) $val);
            if ($teksJawaban !== '') {
                $isBenar = $soal->is_case_sensitive
                    ? ($teksJawaban === $soal->kunci_jawaban)
                    : (strcasecmp($teksJawaban, $soal->kunci_jawaban) === 0);
            }
        }

        JawabanSiswa::updateOrCreate([
            'id_sesi' => $sesi->id_sesi,
            'id_soal' => $soal->id_soal,
        ], [
            'id_pilihan' => $selectedPilihanId,
            'teks_jawaban' => $teksJawaban,
            'is_benar' => $isBenar,
        ]);

        return response()->json(['success' => true]);
    }

    public function pindahSubtes(Request $request, string $id)
    {
        $siswa = auth()->user();
        $paket = PaketLatihan::where('id_paket', $id)->where('status', 'aktif')->where('tipe', 'tryout')->firstOrFail();
        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)->where('id_paket', $paket->id_paket)->where('status', 'aktif')->firstOrFail();

        if ($request->has('jawaban') && is_array($request->jawaban)) {
            $this->saveBatchJawaban($sesi, $request->jawaban);
        }

        $subtestCodes = $this->getPaketSubtestCodes($paket, $sesi);
        return $this->processAdvanceSubtest($sesi, $paket, $subtestCodes);
    }

    public function mulaiSubtesSekarang(Request $request, string $id)
    {
        $siswa = auth()->user();
        $paket = PaketLatihan::where('id_paket', $id)->where('status', 'aktif')->where('tipe', 'tryout')->firstOrFail();
        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)->where('id_paket', $paket->id_paket)->where('status', 'aktif')->firstOrFail();

        // Jika sedang dalam masa jeda 30 detik antar subtes, segera mulai sekarang
        if ($sesi->waktu_mulai_subtes && $sesi->waktu_mulai_subtes->isFuture()) {
            $sesi->update(['waktu_mulai_subtes' => now()]);
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('siswa.tryout.show', $paket->id_paket);
    }

    public function togglePause(Request $request, string $id)
    {
        $siswa = auth()->user();
        $paket = PaketLatihan::where('id_paket', $id)->where('status', 'aktif')->where('tipe', 'tryout')->firstOrFail();
        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)->where('id_paket', $paket->id_paket)->where('status', 'aktif')->firstOrFail();

        if (!$paket->bisa_pause) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Try Out ini tidak dapat dijeda.'], 403);
            }
            return back()->withErrors(['error' => 'Try Out ini tidak dapat dijeda.']);
        }

        $activeCode = $sesi->subtes_aktif;
        $info = PaketLatihan::SUBTES_UTBK[$activeCode] ?? ['durasi_detik' => 1800];
        $totalDurasiDetik = $info['durasi_detik'];

        if (!$sesi->is_paused) {
            // Jeda sekarang: catat sisa detik
            $mulai = $sesi->waktu_mulai_subtes ?: now();
            $elapsed = max(0, now()->timestamp - $mulai->timestamp);
            $initialRemaining = $sesi->sisa_detik_subtes ?? $totalDurasiDetik;
            $sisaDetik = max(0, $initialRemaining - $elapsed);

            // Jika client mengirim sisa waktu aktual (dalam batas wajar), gunakan untuk presisi
            if ($request->has('client_time_left') && is_numeric($request->client_time_left)) {
                $clientTime = (int) $request->client_time_left;
                if ($clientTime >= 0 && $clientTime <= $initialRemaining) {
                    if (abs($clientTime - $sisaDetik) <= 15) {
                        $sisaDetik = $clientTime;
                    }
                }
            }

            $sesi->update([
                'is_paused' => true,
                'sisa_detik_subtes' => $sisaDetik,
            ]);
            $isPaused = true;
        } else {
            // Lanjutkan kembali: waktu_mulai_subtes diset now
            $sisaDetik = $sesi->sisa_detik_subtes ?? $totalDurasiDetik;
            $sesi->update([
                'is_paused' => false,
                'waktu_mulai_subtes' => now(),
            ]);
            $isPaused = false;
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'is_paused' => $isPaused,
                'sisa_detik' => $sisaDetik,
            ]);
        }

        return redirect()->route('siswa.tryout.show', $paket->id_paket);
    }

    public function submit(Request $request, string $id)
    {
        $siswa = auth()->user();
        $paket = PaketLatihan::where('id_paket', $id)->where('status', 'aktif')->where('tipe', 'tryout')->firstOrFail();
        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)->where('id_paket', $paket->id_paket)->firstOrFail();

        if ($sesi->hasil_latihan) {
            return redirect()->route('siswa.tryout.hasil', $paket->id_paket);
        }

        if ($request->has('jawaban') && is_array($request->jawaban)) {
            $this->saveBatchJawaban($sesi, $request->jawaban);
        }

        return $this->executeFinalSubmit($sesi, $paket);
    }

    public function hasil(string $id)
    {
        $siswa = auth()->user();

        $paket = PaketLatihan::where('id_paket', $id)
            ->where('tipe', 'tryout')
            ->with(['soal' => function ($query) {
                $query->where('status', 'aktif')->with('pilihan_jawaban');
            }])
            ->firstOrFail();

        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('id_paket', $paket->id_paket)
            ->with(['jawaban_siswa.pilihan_jawaban', 'jawaban_siswa.soal'])
            ->firstOrFail();

        if (! $sesi->hasil_latihan) {
            return redirect()->route('siswa.tryout.show', $paket->id_paket);
        }

        // Cek apakah hasil masih terkunci (terjadwal rilis IRT)
        $isHasilTerkunci = false;
        $tanggalRilisStr = null;

        if ($paket->tampil_hasil === 'terjadwal') {
            if ($paket->tanggal_tampil_hasil && now()->lt($paket->tanggal_tampil_hasil)) {
                $isHasilTerkunci = true;
                $tanggalRilisStr = $paket->tanggal_tampil_hasil->translatedFormat('d F Y, H:i') . ' WIB';
            }
        }

        // Hitung peringkat dan total peserta (hanya dari siswa yang akunnya aktif / tidak dihapus)
        $scores = HasilLatihan::join('sesi_latihan', 'hasil_latihan.id_sesi', '=', 'sesi_latihan.id_sesi')
            ->join('siswa', 'sesi_latihan.id_siswa', '=', 'siswa.id_siswa')
            ->where('sesi_latihan.id_paket', $id)
            ->whereNotNull('sesi_latihan.id_siswa')
            ->select('sesi_latihan.id_siswa', 'hasil_latihan.nilai_akhir', 'hasil_latihan.id_sesi')
            ->orderBy('hasil_latihan.nilai_akhir', 'desc')
            ->get();

        $totalPeserta = $scores->count();
        $peringkat = 1;
        foreach ($scores as $index => $score) {
            if ($score->id_siswa == $siswa->id_siswa) {
                $peringkat = $index + 1;
                break;
            }
        }

        $rataRata = round($scores->avg('nilai_akhir') * 10, 0);
        $nilaiTertinggi = round($scores->max('nilai_akhir') * 10, 0);

        $completedSesiIds = $scores->pluck('id_sesi')->filter()->values();

        // Agregasi jawaban peserta dalam 1 query efisien untuk semua soal
        $statsMap = [];
        if ($completedSesiIds->isNotEmpty()) {
            $statsMap = JawabanSiswa::whereIn('id_sesi', $completedSesiIds)
                ->selectRaw("
                    id_soal,
                    SUM(CASE WHEN is_benar = true THEN 1 ELSE 0 END) as jumlah_benar,
                    SUM(CASE WHEN is_benar = false AND (id_pilihan IS NOT NULL OR (teks_jawaban IS NOT NULL AND TRIM(teks_jawaban) != '')) THEN 1 ELSE 0 END) as jumlah_salah,
                    SUM(CASE WHEN is_benar = false AND id_pilihan IS NULL AND (teks_jawaban IS NULL OR TRIM(teks_jawaban) = '') THEN 1 ELSE 0 END) as jumlah_kosong
                ")
                ->groupBy('id_soal')
                ->get()
                ->keyBy('id_soal');
        }

        $questionStats = $paket->soal->map(function ($soal) use ($statsMap) {
            $stat = $statsMap[$soal->id_soal] ?? null;

            return [
                'id_soal' => $soal->id_soal,
                'konten_soal' => $soal->konten_soal,
                'kategori' => $soal->kategori,
                'jumlah_benar' => $stat ? (int) $stat->jumlah_benar : 0,
                'jumlah_salah' => $stat ? (int) $stat->jumlah_salah : 0,
                'jumlah_kosong' => $stat ? (int) $stat->jumlah_kosong : 0,
                'pembahasan' => $soal->pembahasan,
            ];
        });

        return Inertia::render('Siswa/Tryout/Hasil', [
            'paket' => $paket,
            'sesi' => $sesi,
            'hasil' => $sesi->hasil_latihan,
            'jawabanSiswa' => $sesi->jawaban_siswa,
            'questionStats' => $questionStats,
            'peringkat' => $peringkat,
            'totalPeserta' => $totalPeserta,
            'rataRata' => $rataRata,
            'nilaiTertinggi' => $nilaiTertinggi,
            'isHasilTerkunci' => $isHasilTerkunci,
            'tanggalRilisStr' => $tanggalRilisStr,
            'tanggalTampilHasil' => $paket->tanggal_tampil_hasil ? $paket->tanggal_tampil_hasil->toISOString() : null,
        ]);
    }

    /**
     * Petakan kategori soal ke kode subtes standar UTBK
     */
    public static function mapKategoriToSubtes(?string $kategori): ?string
    {
        if (!$kategori) {
            return null;
        }

        $k = trim($kategori);
        $lower = strtolower($k);

        // 1. PU (Penalaran Umum)
        if ($k === 'PU' || $lower === 'penalaran umum' || (str_contains($lower, 'penalaran') && str_contains($lower, 'umum'))) {
            return 'PU';
        }

        // 2. PPU (Pengetahuan & Pemahaman Umum)
        if (
            $k === 'PPU' ||
            (str_contains($lower, 'pemahaman') && str_contains($lower, 'umum')) ||
            (str_contains($lower, 'pengetahuan') && str_contains($lower, 'umum'))
        ) {
            return 'PPU';
        }

        // 3. PBM (Pemahaman Bacaan & Menulis)
        if ($k === 'PBM' || (str_contains($lower, 'bacaan') && str_contains($lower, 'menulis'))) {
            return 'PBM';
        }

        // 4. PK (Pengetahuan Kuantitatif)
        if ($k === 'PK' || str_contains($lower, 'kuantitatif')) {
            return 'PK';
        }

        // 5. LBI (Literasi dalam Bahasa Indonesia)
        if (
            $k === 'LBI' ||
            $lower === 'literasi bahasa indonesia' ||
            $lower === 'literasi dalam bahasa indonesia' ||
            (str_contains($lower, 'literasi') && str_contains($lower, 'indonesia')) ||
            $lower === 'bahasa indonesia'
        ) {
            return 'LBI';
        }

        // 6. LBIng (Literasi dalam Bahasa Inggris)
        if (
            $k === 'LBIng' ||
            $k === 'LBE' ||
            $lower === 'literasi bahasa inggris' ||
            $lower === 'literasi dalam bahasa inggris' ||
            str_contains($lower, 'inggris') ||
            str_contains($lower, 'english')
        ) {
            return 'LBIng';
        }

        // 7. PM (Penalaran Matematika)
        if ($k === 'PM' || str_contains($lower, 'matematik') || (str_contains($lower, 'penalaran') && str_contains($lower, 'matematik'))) {
            return 'PM';
        }

        return null;
    }

    /**
     * Dapatkan kode subtes yang akurat untuk suatu soal.
     * Mengutamakan kategori soal asli sehingga tidak pernah salah subtes.
     */
    public static function getSoalSubtesCode($soal): string
    {
        $fromKategori = self::mapKategoriToSubtes($soal->kategori ?? null);
        if ($fromKategori) {
            return $fromKategori;
        }

        if (!empty($soal->pivot?->subtes)) {
            $fromPivot = self::mapKategoriToSubtes($soal->pivot->subtes);
            if ($fromPivot) {
                return $fromPivot;
            }
            return $soal->pivot->subtes;
        }

        return 'PU';
    }

    protected function getPaketSubtestCodes(PaketLatihan $paket, ?SesiLatihan $sesi = null): array
    {
        $existingCodes = $paket->soal->map(fn($s) => self::getSoalSubtesCode($s))->unique()->values();

        // 1. Subtes kelompok TPS yang ada di paket
        $tps = collect(self::ORDER_TPS)->filter(fn($c) => $existingCodes->contains($c))->values()->all();

        // 2. Subtes kelompok Literasi & PM yang ada di paket (selalu di 3 posisi terakhir)
        $literasi = collect(self::ORDER_LITERASI)->filter(fn($c) => $existingCodes->contains($c))->values()->all();

        // 3. Subtes tambahan kustom (jika ada)
        $extras = $existingCodes->diff(self::ORDER_SUBTES)->values()->all();

        if ($paket->is_random) {
            // Seed deterministik konsisten per siswa/sesi agar urutan tidak berubah-ubah di tengah ujian
            $seed = (int) ($sesi ? $sesi->id_sesi : ($paket->id_paket * 1000 + (auth()->id() ?? 1)));

            // Acak urutan 4 subtes TPS (PU, PPU, PBM, PK)
            $tps = $this->seededShuffle($tps, $seed);

            // Acak urutan 3 subtes Literasi & PM (LBI, LBIng, PM), tetap di 3 posisi terakhir
            $literasi = $this->seededShuffle($literasi, $seed + 77);
        }

        $all = array_merge($tps, $literasi, $extras);

        return !empty($all) ? $all : ['PU'];
    }

    protected function seededShuffle(array $items, int $seed): array
    {
        if (count($items) <= 1) {
            return $items;
        }

        mt_srand($seed);
        for ($i = count($items) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            $tmp = $items[$i];
            $items[$i] = $items[$j];
            $items[$j] = $tmp;
        }
        return $items;
    }

    /**
     * Sinkronisasi timeline sesi tryout.
     * Jika tryout tidak dijeda (atau jika paket tidak mengizinkan pause),
     * waktu terus berjalan di server. Jika waktu subtes aktif habis saat user offline/tutup tab,
     * kelebihan waktu (overdue) akan memotong subtes-subtes berikutnya secara berantai (waterfall),
     * atau otomatis menyelesaikan ujian jika seluruh subtes sudah terlewati.
     */
    protected function syncSesiTimeline(SesiLatihan $sesi, PaketLatihan $paket, array $subtestCodes): array
    {
        $firstCode = $subtestCodes[0] ?? 'PU';

        // Pastikan subtes aktif valid
        if (!$sesi->subtes_aktif || !in_array($sesi->subtes_aktif, $subtestCodes)) {
            $subtesSelesai = $sesi->subtes_selesai ?? [];
            $remaining = array_values(array_diff($subtestCodes, $subtesSelesai));
            $targetCode = $remaining[0] ?? $firstCode;
            $durasiDetik = PaketLatihan::SUBTES_UTBK[$targetCode]['durasi_detik'] ?? 1800;

            $sesi->update([
                'subtes_aktif' => $targetCode,
                'waktu_mulai_subtes' => now(),
                'sisa_detik_subtes' => $durasiDetik,
                'is_paused' => false,
                'subtes_selesai' => $subtesSelesai,
            ]);
            $sesi->refresh();
        }

        // Jika tryout disetel TIDAK BISA DIJEDA oleh admin, batalkan pause jika ada
        if (!$paket->bisa_pause && $sesi->is_paused) {
            $sesi->update(['is_paused' => false]);
            $sesi->refresh();
        }

        $activeCode = $sesi->subtes_aktif;
        $infoActive = PaketLatihan::SUBTES_UTBK[$activeCode] ?? [
            'kode' => $activeCode,
            'nama' => $activeCode,
            'durasi_menit' => 30,
            'durasi_detik' => 1800,
        ];
        $totalDurasiDetik = $infoActive['durasi_detik'];

        // Jika ujian sedang dijeda (hanya jika memang diizinkan oleh paket)
        if ($sesi->is_paused) {
            $sisaDetik = max(0, $sesi->sisa_detik_subtes ?? $totalDurasiDetik);
            return [
                'completed' => false,
                'sisa_detik' => $sisaDetik,
            ];
        }

        // Hitung waktu berjalan sejak subtes aktif dimulai/di-resume
        $mulai = $sesi->waktu_mulai_subtes ?: now();
        $nowTs = now()->timestamp;
        $mulaiTs = $mulai->timestamp;

        // Cek apakah sedang dalam masa jeda 30 detik antar subtes (khusus tryout yang tidak bisa dijeda)
        if (!$paket->bisa_pause && $nowTs < $mulaiTs) {
            $sisaJeda = max(0, $mulaiTs - $nowTs);
            return [
                'completed' => false,
                'sisa_detik' => $totalDurasiDetik,
                'is_intermisi' => true,
                'sisa_jeda' => $sisaJeda,
            ];
        }

        $elapsed = max(0, $nowTs - $mulaiTs);
        $initialRemaining = $sesi->sisa_detik_subtes ?? $totalDurasiDetik;

        if ($elapsed < $initialRemaining) {
            // Masih di dalam subtes aktif
            $sisaDetik = $initialRemaining - $elapsed;
            return [
                'completed' => false,
                'sisa_detik' => $sisaDetik,
                'is_intermisi' => false,
                'sisa_jeda' => 0,
            ];
        }

        // Subtes aktif habis waktunya! Alirkan kelebihan waktu (overdue) ke subtes berikutnya
        $overdue = $elapsed - $initialRemaining;
        $subtesSelesai = $sesi->subtes_selesai ?? [];
        if ($activeCode && !in_array($activeCode, $subtesSelesai)) {
            $subtesSelesai[] = $activeCode;
        }

        $remaining = array_values(array_diff($subtestCodes, $subtesSelesai));
        $breakBetween = (!$paket->bisa_pause) ? 30 : 0;

        while (!empty($remaining)) {
            $nextCode = $remaining[0];
            $nextInfo = PaketLatihan::SUBTES_UTBK[$nextCode] ?? ['durasi_detik' => 1800];
            $nextDuration = $nextInfo['durasi_detik'];
            $totalSlot = $nextDuration + $breakBetween;

            if ($overdue >= $totalSlot) {
                // Subtes berikutnya ini juga terlewati habis saat siswa absen
                $overdue -= $totalSlot;
                $subtesSelesai[] = $nextCode;
                array_shift($remaining);
            } else {
                // Kelebihan waktu jatuh di antara jeda 30 detik atau di dalam subtes ini
                if ($breakBetween > 0 && $overdue < $breakBetween) {
                    $sisaJeda = $breakBetween - $overdue;
                    $sesi->update([
                        'subtes_aktif' => $nextCode,
                        'waktu_mulai_subtes' => now()->addSeconds($sisaJeda),
                        'sisa_detik_subtes' => $nextDuration,
                        'subtes_selesai' => $subtesSelesai,
                        'is_paused' => false,
                    ]);
                    $sesi->refresh();

                    return [
                        'completed' => false,
                        'sisa_detik' => $nextDuration,
                        'is_intermisi' => true,
                        'sisa_jeda' => $sisaJeda,
                    ];
                } else {
                    $usedTime = $overdue - $breakBetween;
                    $sisaDetik = max(0, $nextDuration - $usedTime);
                    $sesi->update([
                        'subtes_aktif' => $nextCode,
                        'waktu_mulai_subtes' => now()->subSeconds($usedTime),
                        'sisa_detik_subtes' => $nextDuration,
                        'subtes_selesai' => $subtesSelesai,
                        'is_paused' => false,
                    ]);
                    $sesi->refresh();

                    return [
                        'completed' => false,
                        'sisa_detik' => $sisaDetik,
                        'is_intermisi' => false,
                        'sisa_jeda' => 0,
                    ];
                }
            }
        }

        // Jika semua subtes sudah habis terlewati
        $sesi->update([
            'subtes_selesai' => $subtestCodes,
            'is_paused' => false,
        ]);
        $sesi->refresh();

        return [
            'completed' => true,
            'sisa_detik' => 0,
            'is_intermisi' => false,
            'sisa_jeda' => 0,
        ];
    }

    protected function processAdvanceSubtest(SesiLatihan $sesi, PaketLatihan $paket, array $subtestCodes)
    {
        $subtesSelesai = $sesi->subtes_selesai ?? [];
        if ($sesi->subtes_aktif && !in_array($sesi->subtes_aktif, $subtesSelesai)) {
            $subtesSelesai[] = $sesi->subtes_aktif;
        }

        $remaining = array_values(array_diff($subtestCodes, $subtesSelesai));

        if (empty($remaining)) {
            return $this->executeFinalSubmit($sesi, $paket);
        }

        $nextCode = $remaining[0];
        $durasiDetik = PaketLatihan::SUBTES_UTBK[$nextCode]['durasi_detik'] ?? 1800;

        // Khusus tryout yang TIDAK bisa dijeda: beri jeda 30 detik sebelum subtes baru dimulai
        $waktuMulai = (!$paket->bisa_pause) ? now()->addSeconds(30) : now();

        $sesi->update([
            'subtes_aktif' => $nextCode,
            'waktu_mulai_subtes' => $waktuMulai,
            'sisa_detik_subtes' => $durasiDetik,
            'is_paused' => false,
            'subtes_selesai' => $subtesSelesai,
        ]);

        return redirect()->route('siswa.tryout.show', $paket->id_paket);
    }

    protected function saveBatchJawaban(SesiLatihan $sesi, array $jawabanData)
    {
        foreach ($jawabanData as $idSoal => $val) {
            $soal = Soal::with('pilihan_jawaban')->find($idSoal);
            if (!$soal) continue;

            $selectedPilihanId = null;
            $teksJawaban = null;
            $isBenar = false;

            if ($soal->jenis_soal === 'pilihan_ganda') {
                if ($val) {
                    $pilihan = PilihanJawaban::where('id_pilihan', $val)->where('id_soal', $soal->id_soal)->first();
                    if ($pilihan) {
                        $selectedPilihanId = $pilihan->id_pilihan;
                        $isBenar = strtoupper(trim($pilihan->kode_pilihan)) === strtoupper(trim($soal->kunci_jawaban));
                    }
                }
            } else {
                $teksJawaban = trim((string) $val);
                if ($teksJawaban !== '') {
                    $isBenar = $soal->is_case_sensitive
                        ? ($teksJawaban === $soal->kunci_jawaban)
                        : (strcasecmp($teksJawaban, $soal->kunci_jawaban) === 0);
                }
            }

            JawabanSiswa::updateOrCreate([
                'id_sesi' => $sesi->id_sesi,
                'id_soal' => $soal->id_soal,
            ], [
                'id_pilihan' => $selectedPilihanId,
                'teks_jawaban' => $teksJawaban,
                'is_benar' => $isBenar,
            ]);
        }
    }

    protected function executeFinalSubmit(SesiLatihan $sesi, PaketLatihan $paket)
    {
        $soals = $paket->soal()->where('status', 'aktif')->get();

        $jumlahBenar = JawabanSiswa::where('id_sesi', $sesi->id_sesi)->where('is_benar', true)->count();
        $totalSoal = $soals->count();
        $jumlahSalah = $totalSoal - $jumlahBenar;

        $nilaiAkhir = $totalSoal > 0 ? round(($jumlahBenar / $totalSoal) * 100, 2) : 0;

        DB::beginTransaction();
        try {
            HasilLatihan::updateOrCreate([
                'id_sesi' => $sesi->id_sesi,
            ], [
                'total_soal' => $totalSoal,
                'jumlah_benar' => $jumlahBenar,
                'jumlah_salah' => $jumlahSalah,
                'nilai_akhir' => $nilaiAkhir,
            ]);

            $subtestCodes = $this->getPaketSubtestCodes($paket, $sesi);
            $sesi->update([
                'waktu_selesai' => now(),
                'status' => 'selesai',
                'subtes_selesai' => $subtestCodes,
                'is_paused' => false,
            ]);

            DB::commit();

            // Hitung skor IRT dan tingkat kesulitan psikometrik per soal
            \App\Services\IrtService::recalculateIrtScores($paket->id_paket);

            $hasilTerbaru = HasilLatihan::where('id_sesi', $sesi->id_sesi)->first();
            $nilaiIrt = $hasilTerbaru ? $hasilTerbaru->nilai_akhir : $nilaiAkhir;

            \App\Models\AktivitasSiswa::log('selesai_tryout', 'Siswa menyelesaikan Try Out ' . $paket->nama_paket . ' (Skor IRT: ' . $nilaiIrt . ')');

            return redirect()->route('siswa.tryout.hasil', $paket->id_paket);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyelesaikan try out: ' . $e->getMessage()]);
        }
    }
}
