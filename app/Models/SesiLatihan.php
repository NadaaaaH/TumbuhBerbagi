<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesiLatihan extends Model
{
    use HasFactory;

    protected $table = 'sesi_latihan';
    protected $primaryKey = 'id_sesi';
    public $timestamps = false;

    protected $fillable = [
        'id_siswa',
        'id_paket',
        'subtes_aktif',
        'waktu_mulai_subtes',
        'sisa_detik_subtes',
        'is_paused',
        'subtes_selesai',
        'waktu_mulai',
        'waktu_selesai',
        'status',
    ];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_selesai' => 'datetime',
        'waktu_mulai_subtes' => 'datetime',
        'is_paused' => 'boolean',
        'subtes_selesai' => 'array',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }

    public function paket_latihan()
    {
        return $this->belongsTo(PaketLatihan::class, 'id_paket', 'id_paket');
    }

    public function jawaban_siswa()
    {
        return $this->hasMany(JawabanSiswa::class, 'id_sesi', 'id_sesi');
    }

    public function hasil_latihan()
    {
        return $this->hasOne(HasilLatihan::class, 'id_sesi', 'id_sesi');
    }
}
