<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('paket_latihan')) {
            Schema::table('paket_latihan', function (Blueprint $table) {
                if (!Schema::hasColumn('paket_latihan', 'tanggal_mulai')) {
                    $table->dateTime('tanggal_mulai')->nullable()->after('tanggal_aktif')
                          ->comment('Waktu soal mulai bisa dikerjakan siswa (khusus tryout)');
                }
                if (!Schema::hasColumn('paket_latihan', 'tanggal_selesai')) {
                    $table->dateTime('tanggal_selesai')->nullable()->after('tanggal_mulai')
                          ->comment('Waktu soal ditutup (khusus tryout)');
                }
                if (!Schema::hasColumn('paket_latihan', 'is_random')) {
                    $table->boolean('is_random')->default(false)->after('tanggal_selesai')
                          ->comment('Randomisasi urutan soal dan subtes');
                }
                if (!Schema::hasColumn('paket_latihan', 'bisa_pause')) {
                    $table->boolean('bisa_pause')->default(true)->after('is_random')
                          ->comment('Apakah siswa bisa menjeda pengerjaan');
                }
                if (!Schema::hasColumn('paket_latihan', 'tampil_hasil')) {
                    $table->string('tampil_hasil', 30)->default('setelah_selesai')->after('bisa_pause')
                          ->comment('Kapan hasil & pembahasan ditampilkan: setelah_selesai / terjadwal');
                }
                if (!Schema::hasColumn('paket_latihan', 'tanggal_tampil_hasil')) {
                    $table->dateTime('tanggal_tampil_hasil')->nullable()->after('tampil_hasil')
                          ->comment('Waktu hasil ditampilkan jika mode terjadwal');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('paket_latihan')) {
            Schema::table('paket_latihan', function (Blueprint $table) {
                $cols = ['tanggal_mulai', 'tanggal_selesai', 'is_random', 'bisa_pause', 'tampil_hasil', 'tanggal_tampil_hasil'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('paket_latihan', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
