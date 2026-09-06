<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Jadwal extends Model
{
    use HasFactory;

    protected $table = 'jadwal';
    protected $primaryKey = 'id_jadwal';
    public $timestamps = false;

    protected $fillable = [
        'nama_jadwal',
        'deskripsi',
        'lokasi',
        'gambar',
        'tanggal',
        'waktu_mulai',
        'waktu_selesai',
        'status',
    ];

    protected static function booted()
    {
        static::saving(function ($jadwal) {
            // Jika waktu selesai kosong, otomatis isi 1 jam setelah waktu mulai
            if (empty($jadwal->waktu_selesai) && !empty($jadwal->waktu_mulai)) {
                $jadwal->waktu_selesai = Carbon::parse($jadwal->waktu_mulai)->addHour()->format('H:i:s');
            }
            
            // Jika status kosong, set default ke aktif
            if (empty($jadwal->status)) {
                $jadwal->status = 'aktif';
            }
        });
    }

    public function getStatusAttribute($value)
    {
        // Jika admin mematikan manual di tengah-tengah
        if ($value === 'nonaktif') {
            return 'nonaktif';
        }

        // Cek otomatis nonaktif jika waktu sudah lewat
        if ($this->tanggal && $this->waktu_selesai) {
            $endDateTime = Carbon::parse($this->tanggal . ' ' . $this->waktu_selesai);
            if (now()->greaterThan($endDateTime)) {
                return 'nonaktif';
            }
        } elseif ($this->tanggal && $this->waktu_mulai) {
            // Jika karena alasan tertentu waktu_selesai tetap kosong (legacy data),
            // pakai waktu mulai + 1 jam sebagai patokan
            $endDateTime = Carbon::parse($this->tanggal . ' ' . $this->waktu_mulai)->addHour();
            if (now()->greaterThan($endDateTime)) {
                return 'nonaktif';
            }
        }

        return 'aktif';
    }
}
