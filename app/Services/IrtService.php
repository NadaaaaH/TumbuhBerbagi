<?php

namespace App\Services;

use App\Models\HasilLatihan;
use App\Models\JawabanSiswa;
use App\Models\PaketLatihan;
use App\Models\SesiLatihan;
use App\Models\Soal;
use Illuminate\Support\Facades\DB;

class IrtService
{
    /**
     * Hitung bobot kesulitan empiris (IRT) untuk seluruh soal dalam paket tryout,
     * lalu perbarui tingkat_kesulitan, tingkat_kesulitan_index, dan bobot_nilai di tabel soal.
     *
     * @param int|string $idPaket
     * @return array [id_soal => ['bobot' => float, 'index' => float, 'kategori' => string]]
     */
    public static function calculateAndSyncSoalWeights(int|string $idPaket): array
    {
        $paket = PaketLatihan::with(['soal'])->find($idPaket);
        if (!$paket) return [];

        $soalList = $paket->soal;
        $soalIds = $soalList->pluck('id_soal')->toArray();
        if (empty($soalIds)) return [];

        // Ambil statistik jawaban untuk semua soal pada paket tryout ini dari seluruh sesi selesai
        $stats = DB::table('jawaban_siswa')
            ->join('sesi_latihan', 'jawaban_siswa.id_sesi', '=', 'sesi_latihan.id_sesi')
            ->where('sesi_latihan.id_paket', $idPaket)
            ->where('sesi_latihan.status', 'selesai')
            ->whereIn('jawaban_siswa.id_soal', $soalIds)
            ->select(
                'jawaban_siswa.id_soal',
                DB::raw('COUNT(*) as total_jawaban'),
                DB::raw('SUM(CASE WHEN (jawaban_siswa.is_benar = true OR jawaban_siswa.is_benar = 1) THEN 1 ELSE 0 END) as total_benar')
            )
            ->groupBy('jawaban_siswa.id_soal')
            ->get()
            ->keyBy('id_soal');

        $weights = [];

        foreach ($soalList as $soal) {
            $idSoal = $soal->id_soal;
            $soalStat = $stats->get($idSoal);

            if ($soalStat && $soalStat->total_jawaban > 0) {
                // Proporsi kebenaran (Tingkat Kemudahan empiris P): 0.00 s/d 1.00
                $p = round($soalStat->total_benar / $soalStat->total_jawaban, 3);
            } else {
                // Jika belum ada data empiris, gunakan 0.50 (medium default)
                $p = 0.50;
            }

            // Klasifikasi psikometrik
            if ($p >= 0.70) {
                $kategori = 'mudah';
            } elseif ($p >= 0.30) {
                $kategori = 'medium';
            } else {
                $kategori = 'sulit';
            }

            // Rumus Bobot IRT:
            // Makin sulit soal (P makin kecil), bobot makin tinggi.
            // P = 1.0 (sangat mudah) -> bobot = 1.00
            // P = 0.5 (sedang)        -> bobot = 2.00
            // P = 0.0 (sangat sulit) -> bobot = 3.00
            $bobot = round(1.0 + ((1.0 - $p) * 2.0), 3);

            $weights[$idSoal] = [
                'bobot' => $bobot,
                'index' => $p,
                'kategori' => $kategori,
            ];

            // Update ke tabel soal
            Soal::where('id_soal', $idSoal)->update([
                'tingkat_kesulitan_index' => $p,
                'tingkat_kesulitan' => $kategori,
                'bobot_nilai' => $bobot,
            ]);
        }

        return $weights;
    }

    /**
     * Hitung ulang skor IRT untuk satu sesi tertentu atau seluruh sesi selesai dalam paket.
     *
     * @param int|string $idPaket
     * @param int|string|null $idSesi Khusus sesi tertentu jika null maka semua sesi selesai
     * @return void
     */
    public static function recalculateIrtScores(int|string $idPaket, int|string|null $idSesi = null): void
    {
        $weights = self::calculateAndSyncSoalWeights($idPaket);
        if (empty($weights)) return;

        $totalBobotMaksimal = array_sum(array_column($weights, 'bobot'));
        if ($totalBobotMaksimal <= 0) return;

        $sesiQuery = SesiLatihan::where('id_paket', $idPaket)->where('status', 'selesai');
        if ($idSesi) {
            $sesiQuery->where('id_sesi', $idSesi);
        }

        $sessions = $sesiQuery->with('jawaban_siswa')->get();

        foreach ($sessions as $sesi) {
            $bobotDidapat = 0;
            $jumlahBenar = 0;
            $totalSoal = count($weights);

            foreach ($sesi->jawaban_siswa as $jawaban) {
                if ($jawaban->is_benar && isset($weights[$jawaban->id_soal])) {
                    $bobotDidapat += $weights[$jawaban->id_soal]['bobot'];
                    $jumlahBenar++;
                }
            }

            // Skor IRT dalam skala 0.00 - 100.00 (ditampilkan di UI skala 0 - 1000)
            $skorIrt = round(($bobotDidapat / $totalBobotMaksimal) * 100, 2);
            $jumlahSalah = max(0, $totalSoal - $jumlahBenar);

            HasilLatihan::updateOrCreate([
                'id_sesi' => $sesi->id_sesi,
            ], [
                'total_soal' => $totalSoal,
                'jumlah_benar' => $jumlahBenar,
                'jumlah_salah' => $jumlahSalah,
                'nilai_akhir' => $skorIrt,
            ]);
        }
    }
}
