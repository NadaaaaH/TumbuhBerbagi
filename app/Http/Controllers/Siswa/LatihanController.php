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

class LatihanController extends Controller
{
    public function index()
    {
        $siswa = auth()->user();
        $pakets = PaketLatihan::where('status', 'aktif')
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
            ->pluck('id_paket')
            ->toArray();

        return Inertia::render('Siswa/Latihan/Index', [
            'auth' => ['user' => $siswa],
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
            ->with(['soal' => function ($query) {
                $query->where('status', 'aktif')->with('pilihan_jawaban');
            }])
            ->firstOrFail();

        $sesi = SesiLatihan::firstOrCreate([
            'id_siswa' => $siswa->id_siswa,
            'id_paket' => $paket->id_paket,
        ], [
            'waktu_mulai' => now(),
            'status' => 'aktif',
        ]);

        if ($sesi->hasil_latihan) {
            return redirect()->route('siswa.latihan.hasil', $paket->id_paket);
        }

        return Inertia::render('Siswa/Latihan/Show', [
            'auth' => ['user' => $siswa],
            'paket' => $paket,
            'sesi' => $sesi,
            'soals' => $paket->soal,
        ]);
    }

    public function submit(Request $request, string $id)
    {
        $siswa = auth()->user();

        $paket = PaketLatihan::where('id_paket', $id)
            ->where('status', 'aktif')
            ->firstOrFail();

        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('id_paket', $paket->id_paket)
            ->firstOrFail();

        if ($sesi->hasil_latihan) {
            return redirect()->route('siswa.latihan.hasil', $paket->id_paket);
        }

        $validated = $request->validate([
            'jawaban' => 'nullable|array',
        ]);

        $jawabanData = $validated['jawaban'] ?? [];
        $soals = Soal::where('id_paket', $paket->id_paket)
            ->where('status', 'aktif')
            ->with('pilihan_jawaban')
            ->get();

        $jumlahBenar = 0;
        $jumlahSalah = 0;

        DB::beginTransaction();
        try {
            JawabanSiswa::where('id_sesi', $sesi->id_sesi)->delete();

            foreach ($soals as $soal) {
                $jawaban = $jawabanData[$soal->id_soal] ?? null;
                $isBenar = false;
                $teksJawaban = null;
                $selectedPilihanId = null;

                if ($soal->jenis_soal === 'pilihan_ganda') {
                    if ($jawaban) {
                        $pilihan = PilihanJawaban::find($jawaban);
                        if ($pilihan) {
                            $selectedPilihanId = $pilihan->id_pilihan;
                            $isBenar = strtoupper(trim($pilihan->kode_pilihan)) === strtoupper(trim($soal->kunci_jawaban));
                        }
                    }
                } else {
                    $teksJawaban = trim((string) $jawaban);
                    if ($teksJawaban !== '') {
                        if ($soal->is_case_sensitive) {
                            $isBenar = $teksJawaban === $soal->kunci_jawaban;
                        } else {
                            $isBenar = strcasecmp($teksJawaban, $soal->kunci_jawaban) === 0;
                        }
                    }
                }

                JawabanSiswa::create([
                    'id_sesi' => $sesi->id_sesi,
                    'id_soal' => $soal->id_soal,
                    'id_pilihan' => $selectedPilihanId,
                    'teks_jawaban' => $teksJawaban,
                    'is_benar' => $isBenar,
                ]);

                if ($isBenar) {
                    $jumlahBenar++;
                } else {
                    $jumlahSalah++;
                }
            }

            $totalSoal = $soals->count();
            $nilaiAkhir = $totalSoal > 0
                ? round(($jumlahBenar / $totalSoal) * 100, 2)
                : 0;

            HasilLatihan::create([
                'id_sesi' => $sesi->id_sesi,
                'total_soal' => $totalSoal,
                'jumlah_benar' => $jumlahBenar,
                'jumlah_salah' => $jumlahSalah,
                'nilai_akhir' => $nilaiAkhir,
            ]);

            $sesi->update([
                'waktu_selesai' => now(),
                'status' => 'selesai',
            ]);

            DB::commit();

            return redirect()->route('siswa.latihan.hasil', $paket->id_paket);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengirim jawaban: ' . $e->getMessage()]);
        }
    }

    public function hasil(string $id)
    {
        $siswa = auth()->user();

        $paket = PaketLatihan::where('id_paket', $id)
            ->with(['soal' => function ($query) {
                $query->where('status', 'aktif')->with('pilihan_jawaban');
            }])
            ->firstOrFail();

        $sesi = SesiLatihan::where('id_siswa', $siswa->id_siswa)
            ->where('id_paket', $paket->id_paket)
            ->with(['jawaban_siswa.pilihan_jawaban', 'jawaban_siswa.soal'])
            ->firstOrFail();

        if (! $sesi->hasil_latihan) {
            return redirect()->route('siswa.latihan.show', $paket->id_paket);
        }

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

        return Inertia::render('Siswa/Latihan/Hasil', [
            'auth' => ['user' => $siswa],
            'paket' => $paket,
            'sesi' => $sesi,
            'hasil' => $sesi->hasil_latihan,
            'jawabanSiswa' => $sesi->jawaban_siswa,
            'questionStats' => $questionStats,
        ]);
    }
}
