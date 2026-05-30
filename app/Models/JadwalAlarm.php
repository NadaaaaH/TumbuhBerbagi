<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalAlarm extends Model
{
    protected $table = 'jadwal_alarms';
    protected $primaryKey = 'id_alarm';

    protected $fillable = [
        'id_siswa',
        'id_jadwal',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'id_jadwal', 'id_jadwal');
    }
}
