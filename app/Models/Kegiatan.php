<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
            if (filter_var($this->gambar, FILTER_VALIDATE_URL)) {
                return $this->gambar;
            }
            return Storage::disk(config('filesystems.default'))->url($this->gambar);
        }
        
        return null; // Bisa juga return URL default/placeholder jika diinginkan
    }
}
