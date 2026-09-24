<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    use HasFactory;

    protected $table = 'soal';
    protected $primaryKey = 'id_soal';
    public $timestamps = false;

    protected $fillable = [
        'id_paket',
        'konten_soal',
        'jenis_soal',
        'kategori',
        'tingkat_kesulitan',
        'tingkat_kesulitan_index',
        'kunci_jawaban',
        'pembahasan',
        'bobot_nilai',
        'is_case_sensitive',
        'status',
        'materi',
    ];

    protected $casts = [
        'tingkat_kesulitan_index' => 'float',
        'is_case_sensitive' => 'boolean',
    ];

    public function paket_latihan()
    {
        return $this->belongsToMany(PaketLatihan::class, 'paket_soal', 'id_soal', 'id_paket');
    }

    public function pilihan_jawaban()
    {
        return $this->hasMany(PilihanJawaban::class, 'id_soal', 'id_soal');
    }

    public function jawaban_siswa()
    {
        return $this->hasMany(\App\Models\JawabanSiswa::class, 'id_soal', 'id_soal');
    }

    /**
     * Hitung ulang tingkat_kesulitan_index dan label tingkat_kesulitan
     * berdasarkan seluruh hasil pengerjaan tryout oleh siswa.
     */
    public static function updateDifficultyIndex($idSoal): void
    {
        $stats = \Illuminate\Support\Facades\DB::table('jawaban_siswa')
            ->join('sesi_latihan', 'jawaban_siswa.id_sesi', '=', 'sesi_latihan.id_sesi')
            ->join('paket_latihan', 'sesi_latihan.id_paket', '=', 'paket_latihan.id_paket')
            ->where('jawaban_siswa.id_soal', $idSoal)
            ->where('paket_latihan.tipe', 'tryout')
            ->where('sesi_latihan.status', 'selesai')
            ->selectRaw('COUNT(*) as total_jawaban, SUM(CASE WHEN jawaban_siswa.is_benar = 1 THEN 1 ELSE 0 END) as total_benar')
            ->first();

        if ($stats && $stats->total_jawaban > 0) {
            $index = round($stats->total_benar / $stats->total_jawaban, 2);

            // Klasifikasi Indeks Kesulitan Psikometrik:
            // P >= 0.70 : Mudah
            // 0.30 <= P < 0.70 : Medium (Sedang)
            // P < 0.30 : Sulit
            if ($index >= 0.70) {
                $kategori = 'mudah';
            } elseif ($index >= 0.30) {
                $kategori = 'medium';
            } else {
                $kategori = 'sulit';
            }

            static::where('id_soal', $idSoal)->update([
                'tingkat_kesulitan_index' => $index,
                'tingkat_kesulitan' => $kategori,
            ]);
        }
    }

    /**
     * SQL CASE statement untuk mengurutkan kategori soal sesuai urutan standar subtes UTBK:
     * PU -> PPU -> PBM -> PK -> LBI -> LBE -> PM
     */
    public static function getKategoriOrderSql(string $column = 'kategori'): string
    {
        return "
        CASE 
          WHEN {$column} = 'PU' OR LOWER({$column}) LIKE '%penalaran%umum%' THEN 1
          WHEN {$column} = 'PPU' OR LOWER({$column}) LIKE '%pemahaman%umum%' OR LOWER({$column}) LIKE '%pengetahuan%umum%' THEN 2
          WHEN {$column} = 'PBM' OR (LOWER({$column}) LIKE '%bacaan%' AND LOWER({$column}) LIKE '%menulis%') THEN 3
          WHEN {$column} = 'PK' OR LOWER({$column}) LIKE '%kuantitatif%' THEN 4
          WHEN {$column} = 'LBI' OR LOWER({$column}) LIKE '%indonesia%' THEN 5
          WHEN {$column} IN ('LBE', 'LBIng') OR LOWER({$column}) LIKE '%inggris%' OR LOWER({$column}) LIKE '%english%' THEN 6
          WHEN {$column} = 'PM' OR LOWER({$column}) LIKE '%matematika%' THEN 7
          ELSE 99
        END
        ";
    }

    /**
     * Scope untuk mengurutkan soal berdasarkan subtes UTBK dari kiri ke kanan, lalu id_soal
     */
    public function scopeOrderBySubtesUtbk($query, string $column = 'kategori')
    {
        return $query->orderByRaw(static::getKategoriOrderSql($column) . ' ASC')
                     ->orderBy('soal.id_soal', 'asc');
    }
}
