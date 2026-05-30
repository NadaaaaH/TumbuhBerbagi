<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatistikPengunjungSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 6; $i >= 0; $i--) {
            \App\Models\StatistikPengunjung::firstOrCreate([
                'tanggal' => now()->subDays($i)->toDateString()
            ], [
                'jumlah_siswa' => rand(5, 50),
                'jumlah_tamu' => rand(10, 100)
            ]);
        }
    }
}
