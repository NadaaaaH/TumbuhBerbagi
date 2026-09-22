<?php

namespace App\Models;

use App\Models\SesiLatihan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketLatihan extends Model
{
    use HasFactory;

    public const SUBTES_UTBK = [
        'PU' => [
            'kode' => 'PU',
            'nama' => 'Penalaran Umum',
            'durasi_menit' => 30,
            'durasi_detik' => 1800,
        ],
        'PPU' => [
            'kode' => 'PPU',
            'nama' => 'Pengetahuan & Pemahaman Umum',
            'durasi_menit' => 15,
            'durasi_detik' => 900,
        ],
        'PBM' => [
            'kode' => 'PBM',
            'nama' => 'Pemahaman Bacaan & Menulis',
            'durasi_menit' => 25,
            'durasi_detik' => 1500,
        ],
        'PK' => [
            'kode' => 'PK',
            'nama' => 'Pengetahuan Kuantitatif',
            'durasi_menit' => 20,
            'durasi_detik' => 1200,
        ],
        'LBI' => [
            'kode' => 'LBI',
            'nama' => 'Literasi dalam Bahasa Indonesia',
            'durasi_menit' => 42.5,
            'durasi_detik' => 2550,
        ],
        'LBIng' => [
            'kode' => 'LBIng',
            'nama' => 'Literasi dalam Bahasa Inggris',
            'durasi_menit' => 20,
            'durasi_detik' => 1200,
        ],
        'PM' => [
            'kode' => 'PM',
            'nama' => 'Penalaran Matematika',
            'durasi_menit' => 42.5,
            'durasi_detik' => 2550,
        ],
    ];

    protected $table = 'paket_latihan';
    protected $primaryKey = 'id_paket';
    public $timestamps = false;

    protected $fillable = [
        'nama_paket',
        'deskripsi',
        'status',
        'waktu_ujian',
        'tipe',
        'tanggal_aktif',
        // Tryout-specific
        'tanggal_mulai',
        'tanggal_selesai',
        'is_random',
        'bisa_pause',
        'tampil_hasil',
        'tanggal_tampil_hasil',
    ];

    protected $casts = [
        'tanggal_aktif'        => 'datetime',
        'tanggal_mulai'        => 'datetime',
        'tanggal_selesai'      => 'datetime',
        'tanggal_tampil_hasil' => 'datetime',
        'is_random'            => 'boolean',
        'bisa_pause'           => 'boolean',
    ];

    public function soal()
    {
        return $this->belongsToMany(Soal::class, 'paket_soal', 'id_paket', 'id_soal')
                    ->withPivot('subtes');
    }

    public function sesi_latihan()
    {
        return $this->hasMany(SesiLatihan::class, 'id_paket', 'id_paket');
    }

    public function scopeTryout($query)
    {
        return $query->where('tipe', 'tryout');
    }

    public function scopeLatihan($query)
    {
        return $query->where(function ($q) {
            $q->where('tipe', 'latihan')
              ->orWhereNull('tipe');
        });
    }
}
