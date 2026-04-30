<?php

namespace App\Models;

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
    ];

    public function soal()
    {
        return $this->hasMany(Soal::class, 'id_paket', 'id_paket');
    }
}
