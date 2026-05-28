<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaketLatihan;
use App\Models\SesiLatihan;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SesiLatihanController extends Controller
{
    public function index()
    {
        $pakets = PaketLatihan::withCount(['soal' => function ($query) {
                $query->where('status', 'aktif');
            }, 'sesi_latihan'])
            ->orderBy('id_paket', 'desc')
            ->get();

        return Inertia::render('Admin/SesiLatihan/Index', [
            'pakets' => $pakets,
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
        $paket = PaketLatihan::findOrFail($id);
        $sesiSelesai = SesiLatihan::where('id_paket', $paket->id_paket)
            ->whereHas('hasil_latihan')
            ->with(['siswa', 'hasil_latihan'])
            ->get();

        $filename = "Hasil_Latihan_" . str_replace(' ', '_', $paket->nama_paket) . "_" . date('Ymd_His') . ".csv";

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$filename}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use($sesiSelesai) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['Nama Siswa', 'Email', 'No Handphone', 'Total Soal', 'Jumlah Benar', 'Jumlah Salah', 'Nilai Akhir', 'Waktu Mulai', 'Waktu Selesai']);

            foreach ($sesiSelesai as $sesi) {
                fputcsv($file, [
                    $sesi->siswa->nama ?? '-',
                    $sesi->siswa->email ?? '-',
                    $sesi->siswa->no_handphone ?? '-',
                    $sesi->hasil_latihan->total_soal ?? 0,
                    $sesi->hasil_latihan->jumlah_benar ?? 0,
                    $sesi->hasil_latihan->jumlah_salah ?? 0,
                    $sesi->hasil_latihan->nilai_akhir ?? 0,
                    $sesi->waktu_mulai ?? '-',
                    $sesi->waktu_selesai ?? '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportSiswa(string $id_sesi)
    {
        $sesi = SesiLatihan::with(['siswa', 'paket_latihan', 'hasil_latihan', 'jawaban_siswa.soal', 'jawaban_siswa.pilihan_jawaban'])
            ->findOrFail($id_sesi);

        $siswaNama = str_replace(' ', '_', $sesi->siswa->nama ?? 'Siswa');
        $paketNama = str_replace(' ', '_', $sesi->paket_latihan->nama_paket ?? 'Latihan');
        $filename = "Jawaban_{$siswaNama}_{$paketNama}_" . date('Ymd_His') . ".csv";

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$filename}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use($sesi) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['NAMA SISWA', $sesi->siswa->nama ?? '-']);
            fputcsv($file, ['EMAIL', $sesi->siswa->email ?? '-']);
            fputcsv($file, ['PAKET LATIHAN', $sesi->paket_latihan->nama_paket ?? '-']);
            fputcsv($file, ['NILAI AKHIR', ($sesi->hasil_latihan->nilai_akhir ?? 0) . '%']);
            fputcsv($file, ['BENAR', $sesi->hasil_latihan->jumlah_benar ?? 0]);
            fputcsv($file, ['SALAH', $sesi->hasil_latihan->jumlah_salah ?? 0]);
            fputcsv($file, []);

            fputcsv($file, ['No', 'Kategori', 'Pertanyaan', 'Tipe Soal', 'Jawaban Siswa', 'Kunci Jawaban', 'Status']);

            $no = 1;
            foreach ($sesi->jawaban_siswa as $jawaban) {
                $soal = $jawaban->soal;
                
                $teksJawabanSiswa = '';
                if ($soal) {
                    if ($soal->jenis_soal === 'pilihan_ganda') {
                        $teksJawabanSiswa = ($jawaban->pilihan_jawaban->kode_pilihan ?? '') . '. ' . ($jawaban->pilihan_jawaban->teks_pilihan ?? '');
                    } else {
                        $teksJawabanSiswa = $jawaban->teks_jawaban ?? '';
                    }
                }

                fputcsv($file, [
                    $no++,
                    $soal->kategori ?? '-',
                    $soal->konten_soal ?? '-',
                    $soal ? ($soal->jenis_soal === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Isian') : '-',
                    $teksJawabanSiswa ?: '-',
                    $soal->kunci_jawaban ?? '-',
                    $jawaban->is_benar ? 'Benar' : 'Salah',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
