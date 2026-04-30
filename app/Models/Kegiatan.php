<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'kegiatan';
    protected $primaryKey = 'id_kegiatan';
    public $timestamps = false;

    protected $fillable = [
        'nama_kegiatan',
        'deskripsi',
        'gambar',
        'tanggal',
        'waktu_mulai',
        'waktu_selesai',
        'status',
    ];

    protected $appends = ['gambar_url'];

    public function getGambarUrlAttribute()
    {
        if ($this->gambar) {
            return asset('storage/' . $this->gambar);
        }
        
        return null; // Bisa juga return URL default/placeholder jika diinginkan
    }
}
