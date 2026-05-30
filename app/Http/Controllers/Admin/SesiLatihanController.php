<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaketLatihan;
use App\Models\SesiLatihan;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SesiLatihanController extends Controller
{
    public function index(Request $request)
    {
        $query = PaketLatihan::withCount(['soal' => function ($q) {
                $q->where('status', 'aktif');
            }, 'sesi_latihan']);

        if ($request->has('search') && $request->search != '') {
            $searchTerm = '%' . strtolower($request->search) . '%';
            $query->where(\Illuminate\Support\Facades\DB::raw('LOWER(nama_paket)'), 'like', $searchTerm);
        }

        $pakets = $query->orderBy('id_paket', 'desc')->get();

        return Inertia::render('Admin/SesiLatihan/Index', [
            'pakets' => $pakets,
            'filters' => $request->only(['search'])
        ]);
    }

    public function show(string $id)
    {
        $paket = PaketLatihan::with(['soal' => function ($query) {
                $query->where('status', 'aktif');
            }])
            ->findOrFail($id);

        $sesiSelesai = SesiLatihan::where('id_paket', $paket->id_paket)
            ->whereHas('hasil_latihan')
            ->with(['siswa', 'hasil_latihan'])
            ->get();

        $sudahDikerjakanIds = $sesiSelesai->pluck('id_siswa')->unique()->toArray();
        $semuaSiswa = Siswa::orderBy('nama')->get();

        return Inertia::render('Admin/SesiLatihan/Show', [
            'paket' => $paket,
            'pesertaSudah' => $sesiSelesai,
            'pesertaBelum' => $semuaSiswa->whereNotIn('id_siswa', $sudahDikerjakanIds)->values(),
            'questionStats' => $paket->soal->map(function ($soal) {
                return [
                    'id_soal' => $soal->id_soal,
                    'konten_soal' => $soal->konten_soal,
                    'jumlah_benar' => $soal->jawaban_siswa()->where('is_benar', true)->count(),
                    'jumlah_salah' => $soal->jawaban_siswa()->where('is_benar', false)->count(),
                ];
            }),
        ]);
    }

    public function exportAll(string $id)
    {
        $paket = PaketLatihan::with(['soal'])->findOrFail($id);
        $sesiSelesai = SesiLatihan::where('id_paket', $paket->id_paket)
            ->whereHas('hasil_latihan')
            ->with(['siswa', 'hasil_latihan'])
            ->get();

        $semuaSiswa = Siswa::count();
        $pesertaMengerjakan = $sesiSelesai->count();
        $belumMengerjakan = $semuaSiswa - $pesertaMengerjakan;

        $rataNilai = $pesertaMengerjakan > 0 ? round($sesiSelesai->avg('hasil_latihan.nilai_akhir')) : 0;
        $nilaiTertinggi = $pesertaMengerjakan > 0 ? $sesiSelesai->max('hasil_latihan.nilai_akhir') : 0;
        $nilaiTerendah = $pesertaMengerjakan > 0 ? $sesiSelesai->min('hasil_latihan.nilai_akhir') : 0;

        $pesertaData = $sesiSelesai->map(function ($sesi) {
            $durasi = 0;
            if ($sesi->waktu_mulai && $sesi->waktu_selesai) {
                $mulai = Carbon::parse($sesi->waktu_mulai);
                $selesai = Carbon::parse($sesi->waktu_selesai);
                $durasi = $mulai->diffInMinutes($selesai);
            }
            
            return [
                'nama' => $sesi->siswa->nama ?? '-',
                'nilai' => $sesi->hasil_latihan->nilai_akhir ?? 0,
                'benar' => $sesi->hasil_latihan->jumlah_benar ?? 0,
                'salah' => $sesi->hasil_latihan->jumlah_salah ?? 0,
                'durasi' => $durasi,
            ];
        })->sortByDesc('nilai')->values();

        $analisisSoal = $paket->soal->map(function ($soal) {
            $benar = $soal->jawaban_siswa()->where('is_benar', true)->count();
            $salah = $soal->jawaban_siswa()->where('is_benar', false)->count();
            $total = $benar + $salah;
            $akurasi = $total > 0 ? round(($benar / $total) * 100) : 0;

            return [
                'konten' => $soal->konten_soal,
                'benar' => $benar,
                'salah' => $salah,
                'akurasi' => $akurasi,
            ];
        });

        // Generate kesimpulan
        $kesimpulan = "Belum ada data peserta untuk menarik kesimpulan.";
        if ($pesertaMengerjakan > 0) {
            if ($rataNilai >= 70) {
                $kesimpulan = "Secara umum, peserta sudah cukup memahami materi pada paket latihan ini.\n";
            } else {
                $kesimpulan = "Sebagian besar peserta masih mengalami kesulitan dalam memahami materi pada paket latihan ini.\n";
            }

            if ($analisisSoal->count() > 0) {
                $soalTersulit = $analisisSoal->sortBy('akurasi')->first();
                $idxSoal = $analisisSoal->search($soalTersulit) + 1;
                $kesimpulan .= "Soal nomor {$idxSoal} menjadi soal dengan tingkat kesalahan tertinggi ({$soalTersulit['akurasi']}% akurasi).";
            }
        }

        Carbon::setLocale('id');
        $waktuExport = Carbon::now()->isoFormat('D MMMM Y HH:mm') . ' WIB';
        
        // Cek admin auth
        $admin = Auth::guard('admin')->user();
        $adminNama = $admin ? $admin->name : 'Admin Utama';

        $pdf = Pdf::loadView('pdf.hasil_semua', [
            'paket' => $paket,
            'tanggal' => Carbon::now()->isoFormat('D MMMM Y'),
            'totalSoal' => $paket->soal->count(),
            'totalPeserta' => $semuaSiswa,
            'pesertaMengerjakan' => $pesertaMengerjakan,
            'belumMengerjakan' => $belumMengerjakan,
            'rataNilai' => $rataNilai,
            'nilaiTertinggi' => $nilaiTertinggi,
            'nilaiTerendah' => $nilaiTerendah,
            'peserta' => $pesertaData,
            'analisisSoal' => $analisisSoal,
            'kesimpulan' => $kesimpulan,
            'adminNama' => $adminNama,
            'waktuExport' => $waktuExport,
        ]);

        $filename = "Laporan_Hasil_" . str_replace(' ', '_', $paket->nama_paket) . "_" . date('Ymd') . ".pdf";

        return $pdf->download($filename);
    }

    public function previewAll(string $id)
    {
        $paket = PaketLatihan::with(['soal'])->findOrFail($id);
        $sesiSelesai = SesiLatihan::where('id_paket', $paket->id_paket)
            ->whereHas('hasil_latihan')
            ->with(['siswa', 'hasil_latihan'])
            ->get();

        $semuaSiswa = Siswa::count();
        $pesertaMengerjakan = $sesiSelesai->count();
        $belumMengerjakan = $semuaSiswa - $pesertaMengerjakan;

        $rataNilai = $pesertaMengerjakan > 0 ? round($sesiSelesai->avg('hasil_latihan.nilai_akhir')) : 0;
        $nilaiTertinggi = $pesertaMengerjakan > 0 ? $sesiSelesai->max('hasil_latihan.nilai_akhir') : 0;
        $nilaiTerendah = $pesertaMengerjakan > 0 ? $sesiSelesai->min('hasil_latihan.nilai_akhir') : 0;

        $pesertaData = $sesiSelesai->map(function ($sesi) {
            $durasi = 0;
            if ($sesi->waktu_mulai && $sesi->waktu_selesai) {
                $mulai = Carbon::parse($sesi->waktu_mulai);
                $selesai = Carbon::parse($sesi->waktu_selesai);
                $durasi = $mulai->diffInMinutes($selesai);
            }
            return [
                'nama' => $sesi->siswa->nama ?? '-',
                'nilai' => $sesi->hasil_latihan->nilai_akhir ?? 0,
                'benar' => $sesi->hasil_latihan->jumlah_benar ?? 0,
                'salah' => $sesi->hasil_latihan->jumlah_salah ?? 0,
                'durasi' => $durasi,
            ];
        })->sortByDesc('nilai')->values();

        $analisisSoal = $paket->soal->map(function ($soal) {
            $benar = $soal->jawaban_siswa()->where('is_benar', true)->count();
            $salah = $soal->jawaban_siswa()->where('is_benar', false)->count();
            $total = $benar + $salah;
            $akurasi = $total > 0 ? round(($benar / $total) * 100) : 0;
            return ['konten' => $soal->konten_soal, 'benar' => $benar, 'salah' => $salah, 'akurasi' => $akurasi];
        });

        $kesimpulan = "Belum ada data peserta untuk menarik kesimpulan.";
        if ($pesertaMengerjakan > 0) {
            $kesimpulan = $rataNilai >= 70
                ? "Secara umum, peserta sudah cukup memahami materi pada paket latihan ini.\n"
                : "Sebagian besar peserta masih mengalami kesulitan dalam memahami materi pada paket latihan ini.\n";
            if ($analisisSoal->count() > 0) {
                $soalTersulit = $analisisSoal->sortBy('akurasi')->first();
                $idxSoal = $analisisSoal->search($soalTersulit) + 1;
                $kesimpulan .= "Soal nomor {$idxSoal} menjadi soal dengan tingkat kesalahan tertinggi ({$soalTersulit['akurasi']}% akurasi).";
            }
        }

        Carbon::setLocale('id');
        $waktuExport = Carbon::now()->isoFormat('D MMMM Y HH:mm') . ' WIB';
        $admin = Auth::guard('admin')->user();
        $adminNama = $admin ? $admin->name : 'Admin Utama';

        $pdf = Pdf::loadView('pdf.hasil_semua', [
            'paket' => $paket,
            'tanggal' => Carbon::now()->isoFormat('D MMMM Y'),
            'totalSoal' => $paket->soal->count(),
            'totalPeserta' => $semuaSiswa,
            'pesertaMengerjakan' => $pesertaMengerjakan,
            'belumMengerjakan' => $belumMengerjakan,
            'rataNilai' => $rataNilai,
            'nilaiTertinggi' => $nilaiTertinggi,
            'nilaiTerendah' => $nilaiTerendah,
            'peserta' => $pesertaData,
            'analisisSoal' => $analisisSoal,
            'kesimpulan' => $kesimpulan,
            'adminNama' => $adminNama,
            'waktuExport' => $waktuExport,
        ]);

        return $pdf->stream("preview_semua.pdf");
    }

    public function exportSiswa(string $id_sesi)
    {
        $sesi = SesiLatihan::with(['siswa', 'paket_latihan', 'hasil_latihan', 'jawaban_siswa.soal', 'jawaban_siswa.pilihan_jawaban'])
            ->findOrFail($id_sesi);

        $siswaNama = str_replace(' ', '_', $sesi->siswa->nama ?? 'Siswa');
        $paketNama = str_replace(' ', '_', $sesi->paket_latihan->nama_paket ?? 'Latihan');

        $durasi = 0;
        if ($sesi->waktu_mulai && $sesi->waktu_selesai) {
            $mulai = Carbon::parse($sesi->waktu_mulai);
            $selesai = Carbon::parse($sesi->waktu_selesai);
            $durasi = $mulai->diffInMinutes($selesai);
        }

        $detailJawaban = $sesi->jawaban_siswa->map(function ($jawaban) {
            $soal = $jawaban->soal;
            $teksJawabanSiswa = '-';
            
            if ($soal) {
                if ($soal->jenis_soal === 'pilihan_ganda') {
                    $teksJawabanSiswa = ($jawaban->pilihan_jawaban->kode_pilihan ?? '') . '. ' . ($jawaban->pilihan_jawaban->teks_pilihan ?? '');
                } else {
                    $teksJawabanSiswa = $jawaban->teks_jawaban ?? '';
                }
            }

            return [
                'pertanyaan' => $soal->konten_soal ?? '-',
                'jawaban_siswa' => $teksJawabanSiswa,
                'jawaban_benar' => $soal->kunci_jawaban ?? '-',
                'status' => $jawaban->is_benar ? 'BENAR' : 'SALAH',
            ];
        });

        $nilaiAkhir = $sesi->hasil_latihan->nilai_akhir ?? 0;
        
        $kesimpulan = "Siswa telah menyelesaikan sesi latihan dengan\ntingkat akurasi sebesar {$nilaiAkhir}%.\n\n";
        if ($nilaiAkhir >= 70) {
            $kesimpulan .= "Siswa menunjukkan pemahaman yang sangat baik\nterhadap materi pada paket latihan ini.";
        } else {
            $kesimpulan .= "Disarankan untuk mempelajari kembali materi\npada soal yang dijawab salah.";
        }

        Carbon::setLocale('id');

        $pdf = Pdf::loadView('pdf.hasil_siswa', [
            'siswa' => $sesi->siswa,
            'paket' => $sesi->paket_latihan,
            'tanggal' => Carbon::now()->isoFormat('D MMMM Y'),
            'hasil' => $sesi->hasil_latihan,
            'durasi' => $durasi,
            'detailJawaban' => $detailJawaban,
            'kesimpulan' => $kesimpulan,
        ]);

        $filename = "Hasil_{$siswaNama}_{$paketNama}_" . date('Ymd') . ".pdf";

        return $pdf->download($filename);
    }

    public function previewSiswa(string $id_sesi)
    {
        $sesi = SesiLatihan::with(['siswa', 'paket_latihan', 'hasil_latihan', 'jawaban_siswa.soal', 'jawaban_siswa.pilihan_jawaban'])
            ->findOrFail($id_sesi);

        $durasi = 0;
        if ($sesi->waktu_mulai && $sesi->waktu_selesai) {
            $mulai = Carbon::parse($sesi->waktu_mulai);
            $selesai = Carbon::parse($sesi->waktu_selesai);
            $durasi = $mulai->diffInMinutes($selesai);
        }

        $detailJawaban = $sesi->jawaban_siswa->map(function ($jawaban) {
            $soal = $jawaban->soal;
            $teksJawabanSiswa = '-';
            if ($soal) {
                if ($soal->jenis_soal === 'pilihan_ganda') {
                    $teksJawabanSiswa = ($jawaban->pilihan_jawaban->kode_pilihan ?? '') . '. ' . ($jawaban->pilihan_jawaban->teks_pilihan ?? '');
                } else {
                    $teksJawabanSiswa = $jawaban->teks_jawaban ?? '';
                }
            }
            return [
                'pertanyaan' => $soal->konten_soal ?? '-',
                'jawaban_siswa' => $teksJawabanSiswa,
                'jawaban_benar' => $soal->kunci_jawaban ?? '-',
                'status' => $jawaban->is_benar ? 'BENAR' : 'SALAH',
            ];
        });

        $nilaiAkhir = $sesi->hasil_latihan->nilai_akhir ?? 0;
        $kesimpulan = "Siswa telah menyelesaikan sesi latihan dengan\ntingkat akurasi sebesar {$nilaiAkhir}%.\n\n";
        if ($nilaiAkhir >= 70) {
            $kesimpulan .= "Siswa menunjukkan pemahaman yang sangat baik\nterhadap materi pada paket latihan ini.";
        } else {
            $kesimpulan .= "Disarankan untuk mempelajari kembali materi\npada soal yang dijawab salah.";
        }

        Carbon::setLocale('id');

        $pdf = Pdf::loadView('pdf.hasil_siswa', [
            'siswa' => $sesi->siswa,
            'paket' => $sesi->paket_latihan,
            'tanggal' => Carbon::now()->isoFormat('D MMMM Y'),
            'hasil' => $sesi->hasil_latihan,
            'durasi' => $durasi,
            'detailJawaban' => $detailJawaban,
            'kesimpulan' => $kesimpulan,
        ]);

        return $pdf->stream("preview_siswa.pdf");
    }
}
