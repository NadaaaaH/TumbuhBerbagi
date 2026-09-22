<?php

namespace App\Console\Commands;

use App\Models\PaketLatihan;
use App\Services\IrtService;
use Illuminate\Console\Command;

class HitungSkorIrtCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tryout:hitung-irt {id_paket? : ID Paket Try Out spesifik}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kalkulasi bobot kesulitan soal (IRT) dan hitung ulang skor seluruh peserta Try Out';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $idPaket = $this->argument('id_paket');

        if ($idPaket) {
            $pakets = PaketLatihan::where('id_paket', $idPaket)->where('tipe', 'tryout')->get();
        } else {
            $pakets = PaketLatihan::where('tipe', 'tryout')->get();
        }

        if ($pakets->isEmpty()) {
            $this->warn('Tidak ada paket tryout yang ditemukan.');
            return Command::SUCCESS;
        }

        $this->info("Memulai kalkulasi IRT untuk {$pakets->count()} paket tryout...");

        foreach ($pakets as $paket) {
            $this->line("-> Memproses Paket #{$paket->id_paket} [{$paket->nama_paket}]...");
            IrtService::recalculateIrtScores($paket->id_paket);
        }

        $this->info('Kalkulasi skor IRT dan tingkat kesulitan soal selesai diperbarui!');
        return Command::SUCCESS;
    }
}
