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
    protected const ORDER_SUBTES = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBIng', 'PM'];

    public function index()
    {
        $siswa = auth()->user();

        $pakets = PaketLatihan::where('status', 'aktif')
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
            ->where('status', 'aktif')
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

        $subtestCodes = $this->getPaketSubtestCodes($paket);
        $firstCode = $subtestCodes[0] ?? 'PU';

        $sesi = SesiLatihan::firstOrCreate([
            'id_siswa' => $siswa->id_siswa,
            'id_paket' => $paket->id_paket,
        ], [
            'waktu_mulai' => now(),
            'status' => 'aktif',
            'subtes_aktif' => $firstCode,
            'waktu_mulai_subtes' => now(),
            'subtes_selesai' => [],
            'is_paused' => false,
            'sisa_detik_subtes' => PaketLatihan::SUBTES_UTBK[$firstCode]['durasi_detik'] ?? 1800,
        ]);

        if ($sesi->wasRecentlyCreated) {
            \App\Models\AktivitasSiswa::log('mulai_tryout', 'Siswa memulai Try Out ' . $paket->nama_paket);
        }

        if ($sesi->hasil_latihan) {
            return redirect()->route('siswa.tryout.hasil', $paket->id_paket);
        }

        // Jika subtes aktif belum terisi di sesi lama
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
        }

        // Hitung sisa waktu subtes aktif
        $activeCode = $sesi->subtes_aktif;
        $infoActive = PaketLatihan::SUBTES_UTBK[$activeCode] ?? [
            'kode' => $activeCode,
            'nama' => $activeCode,
            'durasi_menit' => 30,
            'durasi_detik' => 1800,
        ];
        $totalDurasiDetik = $infoActive['durasi_detik'];

        if ($sesi->is_paused) {
            $sisaDetik = max(0, $sesi->sisa_detik_subtes ?? $totalDurasiDetik);
        } else {
            $mulai = $sesi->waktu_mulai_subtes ?: now();
            $elapsed = max(0, now()->diffInSeconds($mulai, false));
            $initialRemaining = $sesi->sisa_detik_subtes ?? $totalDurasiDetik;
            $sisaDetik = max(0, $initialRemaining - $elapsed);
        }

        // Jika waktu subtes habis saat halaman dibuka, otomatis advance
        if ($sisaDetik <= 0 && $sesi->waktu_mulai_subtes) {
            return $this->processAdvanceSubtest($sesi, $paket, $subtestCodes);
        }

        // Daftar Subtes untuk Tab Navigasi Header
        $subtesList = collect($subtestCodes)->map(function ($code) use ($sesi, $paket) {
            $info = PaketLatihan::SUBTES_UTBK[$code] ?? [
                'kode' => $code,
                'nama' => $code,
                'durasi_menit' => 30,
                'durasi_detik' => 1800,
            ];
            $soalCount = $paket->soal->filter(fn($s) => ($s->pivot->subtes ?: 'PU') === $code)->count();
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
            return ($s->pivot->subtes ?: 'PU') === $activeCode;
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

        $subtestCodes = $this->getPaketSubtestCodes($paket);
        return $this->processAdvanceSubtest($sesi, $paket, $subtestCodes);
    }

    public function togglePause(Request $request, string $id)
    {
        $siswa = auth()->user();
        $paket = PaketLatihan::where('id_paket', $id)->where('status', 'aktif')->where('tipe', 'tryout')->firstOrFail();
        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)->where('id_paket', $paket->id_paket)->where('status', 'aktif')->firstOrFail();

        if (!$paket->bisa_pause) {
            return back()->withErrors(['error' => 'Try Out ini tidak dapat dijeda.']);
        }

        $activeCode = $sesi->subtes_aktif;
        $info = PaketLatihan::SUBTES_UTBK[$activeCode] ?? ['durasi_detik' => 1800];
        $totalDurasiDetik = $info['durasi_detik'];

        if (!$sesi->is_paused) {
            // Jeda sekarang: catat sisa detik
            $elapsed = max(0, now()->diffInSeconds($sesi->waktu_mulai_subtes ?: now(), false));
            $initialRemaining = $sesi->sisa_detik_subtes ?? $totalDurasiDetik;
            $sisaDetik = max(0, $initialRemaining - $elapsed);

            $sesi->update([
                'is_paused' => true,
                'sisa_detik_subtes' => $sisaDetik,
            ]);
        } else {
            // Lanjutkan kembali: waktu_mulai_subtes diset now
            $sesi->update([
                'is_paused' => false,
                'waktu_mulai_subtes' => now(),
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

        $scores = HasilLatihan::join('sesi_latihan', 'hasil_latihan.id_sesi', '=', 'sesi_latihan.id_sesi')
            ->where('sesi_latihan.id_paket', $id)
            ->select('sesi_latihan.id_siswa', 'hasil_latihan.nilai_akhir')
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

        $questionStats = $paket->soal->map(function ($soal) {
            return [
                'id_soal' => $soal->id_soal,
                'konten_soal' => $soal->konten_soal,
                'kategori' => $soal->kategori,
                'jumlah_benar' => JawabanSiswa::where('id_soal', $soal->id_soal)->where('is_benar', true)->count(),
                'jumlah_salah' => JawabanSiswa::where('id_soal', $soal->id_soal)->where('is_benar', false)->count(),
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

    protected function getPaketSubtestCodes(PaketLatihan $paket): array
    {
        $existingCodes = $paket->soal->map(fn($s) => $s->pivot->subtes ?: 'PU')->unique()->values();
        $ordered = collect(self::ORDER_SUBTES)->filter(fn($c) => $existingCodes->contains($c))->values();
        $extras = $existingCodes->diff(self::ORDER_SUBTES)->values();
        $all = $ordered->merge($extras)->values()->all();

        return !empty($all) ? $all : ['PU'];
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

        $sesi->update([
            'subtes_aktif' => $nextCode,
            'waktu_mulai_subtes' => now(),
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

            $subtestCodes = $this->getPaketSubtestCodes($paket);
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
