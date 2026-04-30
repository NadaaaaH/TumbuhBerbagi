<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilLatihan extends Model
{
    use HasFactory;

    protected $table = 'hasil_latihan';
    protected $primaryKey = 'id_hasil';
    public $timestamps = false;

    protected $fillable = [
        'id_sesi',
        'total_soal',
        'jumlah_benar',
        'jumlah_salah',
        'nilai_akhir',
    ];

    public function sesi_latihan()
    {
        return $this->belongsTo(SesiLatihan::class, 'id_sesi', 'id_sesi');
    }
}
