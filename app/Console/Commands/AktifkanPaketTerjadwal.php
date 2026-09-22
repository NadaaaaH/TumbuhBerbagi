<?php

namespace App\Console\Commands;

use App\Models\Notifikasi;
use App\Models\PaketLatihan;
use App\Models\Siswa;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AktifkanPaketTerjadwal extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'paket:aktifkan-terjadwal';

    /**
     * The console command description.
     */
    protected $description = 'Aktifkan paket latihan yang sudah mencapai tanggal jadwal aktivasinya.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $now = Carbon::now();

        // Ambil semua paket yang terjadwal dan waktunya sudah tiba
        $pakets = PaketLatihan::where('status', 'nonaktif')
            ->whereNotNull('tanggal_aktif')
            ->where('tanggal_aktif', '<=', $now)
            ->get();

        if ($pakets->isEmpty()) {
            $this->info('Tidak ada paket yang perlu diaktifkan.');
            return;
        }

        $siswas = Siswa::all();

        foreach ($pakets as $paket) {
            // Aktifkan paket & hapus jadwal (sudah terlaksana)
            $paket->update([
                'status'        => 'aktif',
                'tanggal_aktif' => null,
            ]);

            // Kirim notifikasi ke semua siswa
            $labelNotif = $paket->tipe === 'tryout' ? 'Try Out' : 'Latihan Soal';

            foreach ($siswas as $siswa) {
                // Hindari duplikasi notifikasi
                $exists = Notifikasi::where('id_siswa', $siswa->id_siswa)
                    ->where('tipe', $paket->tipe === 'tryout' ? 'tryout' : 'latihan')
                    ->where('id_referensi', $paket->id_paket)
                    ->exists();

                if (!$exists) {
                    Notifikasi::create([
                        'id_siswa'     => $siswa->id_siswa,
                        'judul'        => $labelNotif . ' Baru',
                        'pesan'        => 'Paket ' . strtolower($labelNotif) . ' "' . $paket->nama_paket . '" sekarang sudah aktif. Yuk dikerjakan!',
                        'tipe'         => $paket->tipe === 'tryout' ? 'tryout' : 'latihan',
                        'id_referensi' => $paket->id_paket,
                        'is_dibaca'    => false,
                    ]);
                }
            }

            $this->info("Paket [{$paket->id_paket}] \"{$paket->nama_paket}\" berhasil diaktifkan.");
        }

        $this->info("Total {$pakets->count()} paket diaktifkan.");
    }
}
