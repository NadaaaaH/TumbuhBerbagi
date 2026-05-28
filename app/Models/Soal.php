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
        'kunci_jawaban',
        'pembahasan',
        'bobot_nilai',
        'is_case_sensitive',
        'status',
    ];

    public function paket_latihan()
    {
        return $this->belongsTo(PaketLatihan::class, 'id_paket', 'id_paket');
    }

    public function pilihan_jawaban()
    {
        return $this->hasMany(PilihanJawaban::class, 'id_soal', 'id_soal');
    }

    public function jawaban_siswa()
    {
        return $this->hasMany(\App\Models\JawabanSiswa::class, 'id_soal', 'id_soal');
    }
}
