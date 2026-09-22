<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Aktifkan paket latihan yang sudah mencapai jadwal aktivasinya (setiap menit)
Schedule::command('paket:aktifkan-terjadwal')->everyMinute();
