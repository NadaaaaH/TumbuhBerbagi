<?php

namespace App\Models;

use App\Models\SesiLatihan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketLatihan extends Model
{
    use HasFactory;

    protected $table = 'paket_latihan';
    protected $primaryKey = 'id_paket';
    public $timestamps = false;

    protected $fillable = [
        'nama_paket',
        'deskripsi',
        'status',
        'waktu_ujian',
        'tipe',
    ];

    public function soal()
    {
        return $this->hasMany(Soal::class, 'id_paket', 'id_paket');
    }

    public function sesi_latihan()
    {
        return $this->hasMany(SesiLatihan::class, 'id_paket', 'id_paket');
    }
}
