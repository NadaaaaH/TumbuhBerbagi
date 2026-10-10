<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HasilLatihan;
use App\Models\PaketLatihan;
use App\Models\SesiLatihan;
use App\Services\Admin\SesiLatihanDetailService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SesiLatihanController extends Controller
{
    public function __construct(private SesiLatihanDetailService $detailService)
    {
    }

    public function index(Request $request)
    {
        $pakets = PaketLatihan::withCount(['soal' => function ($q) {
                $q->where('status', 'aktif');
            }, 'sesi_latihan'])->orderBy('id_paket', 'desc')->get();

        return Inertia::render('Admin/SesiLatihan/Index', [
            'pakets' => $pakets,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:selesai,sedang_mengerjakan,belum_mulai'],
            'sort' => ['nullable', 'in:nilai_desc,nilai_asc,nama_asc,nama_desc,terbaru'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $paket = PaketLatihan::with(['soal' => function ($query) {
                $query->where('status', 'aktif');
                $query->with('pilihan_jawaban');
            }])
            ->findOrFail($id);

        return Inertia::render('Admin/SesiLatihan/Show', [
            'paket' => $paket,
            'summary' => $this->detailService->summary($paket),
            'participants' => $this->detailService->participants($paket, $filters),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'sort' => $filters['sort'] ?? 'nilai_desc',
            ],
            'questionStats' => $this->detailService->questionStats($paket),
        ]);
    }

    public function exportAll(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        $pdf = Pdf::loadView('pdf.hasil_semua', $this->allReportData($paket));

        $filename = "Laporan_Hasil_" . str_replace(' ', '_', $paket->nama_paket) . "_" . date('Ymd') . ".pdf";

        return $pdf->download($filename);
    }

    public function previewAll(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        Carbon::setLocale('id');
        $pdf = Pdf::loadView('pdf.hasil_semua', $this->allReportData($paket));

        return $pdf->stream("preview_semua.pdf");
    }

    public function exportSiswa(string $id_sesi)
    {
        $report = $this->studentReportData($id_sesi);
        $sesi = $report['sesi'];
        Carbon::setLocale('id');
        $pdf = Pdf::loadView('pdf.hasil_siswa', $report);

        $filename = "Hasil_{$report['siswaNama']}_{$report['paketNama']}_" . date('Ymd') . ".pdf";

        return $pdf->download($filename);
    }

    public function previewSiswa(string $id_sesi)
    {
        $report = $this->studentReportData($id_sesi);
        Carbon::setLocale('id');
        $pdf = Pdf::loadView('pdf.hasil_siswa', $report);

        return $pdf->stream("preview_siswa.pdf");
    }

    public function hitungIrt(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        \App\Services\IrtService::recalculateIrtScores($paket->id_paket);

        return back()->with('success', 'Skor IRT dan tingkat kesulitan soal berhasil dihitung ulang!');
    }

    private function allReportData(PaketLatihan $paket): array
    {
        Carbon::setLocale('id');
        $summary = $this->detailService->summary($paket);
        $peserta = $this->detailService->reportParticipants($paket);
        $questionStats = $this->detailService->questionStats($paket);
        $validScores = $peserta->pluck('nilai')->filter(fn ($score) => $score !== null);

        $analisisSoal = $questionStats->map(fn ($question) => [
            'konten' => $question['konten_soal'],
            'benar' => $question['jumlah_benar'],
            'salah' => $question['jumlah_salah'],
            'kosong' => $question['jumlah_kosong'],
            'akurasi' => $question['akurasi'],
        ]);

        if ($summary['rata_rata_nilai'] === null) {
            $kesimpulan = 'Belum ada hasil nilai valid untuk menarik kesimpulan.';
        } else {
            $kesimpulan = $summary['rata_rata_nilai'] >= 70
                ? "Secara umum, peserta sudah cukup memahami materi pada paket latihan ini.\n"
                : "Sebagian besar peserta masih mengalami kesulitan dalam memahami materi pada paket latihan ini.\n";
        }

        $soalTersulit = $analisisSoal
            ->filter(fn ($question) => $question['akurasi'] !== null)
            ->sortBy('akurasi')
            ->first();

        if ($soalTersulit !== null) {
            $idxSoal = $analisisSoal->search($soalTersulit) + 1;
            $kesimpulan .= "Soal nomor {$idxSoal} menjadi soal dengan tingkat kesalahan tertinggi ({$soalTersulit['akurasi']}% akurasi).";
        }

        $admin = Auth::guard('admin')->user();

        return [
            'paket' => $paket,
            'tanggal' => Carbon::now()->isoFormat('D MMMM Y'),
            'totalSoal' => $questionStats->count(),
            'totalPeserta' => $summary['total'],
            'pesertaMengerjakan' => $summary['selesai'],
            'belumMengerjakan' => $summary['total'] - $summary['selesai'],
            'rataNilai' => $summary['rata_rata_nilai'],
            'nilaiTertinggi' => $validScores->isEmpty() ? null : $validScores->max(),
            'nilaiTerendah' => $validScores->isEmpty() ? null : $validScores->min(),
            'peserta' => $peserta,
            'analisisSoal' => $analisisSoal,
            'kesimpulan' => $kesimpulan,
            'adminNama' => $admin ? $admin->nama : 'Admin Utama',
            'waktuExport' => Carbon::now()->isoFormat('D MMMM Y HH:mm') . ' WIB',
        ];
    }

    private function studentReportData(string $idSesi): array
    {
        $sesi = SesiLatihan::with([
            'siswa',
            'paket_latihan',
            'hasil_latihan',
            'jawaban_siswa.soal',
            'jawaban_siswa.pilihan_jawaban',
        ])->findOrFail($idSesi);

        $hasil = HasilLatihan::where('id_sesi', $sesi->id_sesi)
            ->orderByDesc('id_hasil')
            ->first();
        abort_unless($sesi->status === 'selesai' && $hasil, 404);
        $sesi->setRelation('hasil_latihan', $hasil);

        $jawabanTerbaru = $sesi->jawaban_siswa
            ->sortByDesc('id_jawaban')
            ->unique('id_soal')
            ->sortBy('id_soal')
            ->values();

        $detailJawaban = $jawabanTerbaru->map(function ($jawaban) {
            $soal = $jawaban->soal;
            $kosong = $jawaban->id_pilihan === null
                && trim((string) $jawaban->teks_jawaban) === '';
            $teksJawaban = '-';

            if (!$kosong && $soal?->jenis_soal === 'pilihan_ganda') {
                $teksJawaban = ($jawaban->pilihan_jawaban->kode_pilihan ?? '') . '. '
                    . ($jawaban->pilihan_jawaban->teks_pilihan ?? '');
            } elseif (!$kosong) {
                $teksJawaban = $jawaban->teks_jawaban;
            }

            return [
                'pertanyaan' => $soal->konten_soal ?? '-',
                'jawaban_siswa' => $teksJawaban,
                'jawaban_benar' => $soal->kunci_jawaban ?? '-',
                'status' => $kosong ? 'KOSONG' : ($jawaban->is_benar ? 'BENAR' : 'SALAH'),
            ];
        });

        $nilaiAkhir = $sesi->hasil_latihan->nilai_akhir;
        $kesimpulan = $nilaiAkhir === null
            ? 'Nilai akhir belum tersedia; tidak ada skor valid pada sesi ini.'
            : "Siswa telah menyelesaikan sesi latihan dengan\nnilai akhir sebesar {$nilaiAkhir}%.\n\n"
                . ($nilaiAkhir >= 70
                    ? "Siswa menunjukkan pemahaman yang sangat baik\nterhadap materi pada paket latihan ini."
                    : "Disarankan untuk mempelajari kembali materi\npada soal yang dijawab salah.");

        return [
            'sesi' => $sesi,
            'siswa' => $sesi->siswa,
            'paket' => $sesi->paket_latihan,
            'siswaNama' => str_replace(' ', '_', $sesi->siswa->nama ?? 'Siswa'),
            'paketNama' => str_replace(' ', '_', $sesi->paket_latihan->nama_paket ?? 'Latihan'),
            'tanggal' => Carbon::now()->isoFormat('D MMMM Y'),
            'hasil' => $sesi->hasil_latihan,
            'durasi' => $this->durationMinutes($sesi->waktu_mulai, $sesi->waktu_selesai),
            'detailJawaban' => $detailJawaban,
            'kesimpulan' => $kesimpulan,
        ];
    }

    private function durationMinutes($startedAt, $endedAt): ?int
    {
        if (!$startedAt) {
            return null;
        }

        $start = Carbon::parse($startedAt);
        $end = $endedAt ? Carbon::parse($endedAt) : now();

        return $end->lessThan($start)
            ? 0
            : (int) round($start->diffInSeconds($end) / 60);
    }
}
