<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilihanJawaban extends Model
{
    use HasFactory;

    protected $table = 'pilihan_jawaban';
    protected $primaryKey = 'id_pilihan';
    public $timestamps = false;

    protected $fillable = [
        'id_soal',
        'kode_pilihan',
        'teks_pilihan',
    ];

    public function soal()
    {
        return $this->belongsTo(Soal::class, 'id_soal', 'id_soal');
    }
}
