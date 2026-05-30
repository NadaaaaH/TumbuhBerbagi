<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatistikPengunjung extends Model
{
    protected $table = 'statistik_pengunjung';

    protected $fillable = [
        'tanggal',
        'jumlah_siswa',
        'jumlah_tamu',
    ];
}
