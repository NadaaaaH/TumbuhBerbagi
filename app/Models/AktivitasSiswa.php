<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AktivitasSiswa extends Model
{
    protected $table = 'aktivitas_siswa';
    protected $primaryKey = 'id_aktivitas';

    protected $fillable = [
        'id_siswa',
        'tipe_aktivitas',
        'deskripsi',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }

    public static function log($tipe, $deskripsi)
    {
        $id_siswa = auth('siswa')->id();
        
        self::create([
            'id_siswa' => $id_siswa,
            'tipe_aktivitas' => $tipe,
            'deskripsi' => $deskripsi,
        ]);
    }
}
