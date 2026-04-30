<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanSiswa extends Model
{
    use HasFactory;

    protected $table = 'jawaban_siswa';
    protected $primaryKey = 'id_jawaban';
    public $timestamps = false;

    protected $fillable = [
        'id_sesi',
        'id_soal',
        'id_pilihan',
        'teks_jawaban',
        'is_benar',
    ];

    public function sesi_latihan()
    {
        return $this->belongsTo(SesiLatihan::class, 'id_sesi', 'id_sesi');
    }

    public function soal()
    {
        return $this->belongsTo(Soal::class, 'id_soal', 'id_soal');
    }

    public function pilihan_jawaban()
    {
        return $this->belongsTo(PilihanJawaban::class, 'id_pilihan', 'id_pilihan');
    }
}
