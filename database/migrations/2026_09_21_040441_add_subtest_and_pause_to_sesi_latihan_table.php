<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('sesi_latihan')) {
            Schema::table('sesi_latihan', function (Blueprint $table) {
                if (!Schema::hasColumn('sesi_latihan', 'subtes_aktif')) {
                    $table->string('subtes_aktif', 20)->nullable()->after('id_paket')
                          ->comment('Kode subtes yang sedang aktif (PU, PPU, PK, PBM, LBI, LBIng, PM)');
                }
                if (!Schema::hasColumn('sesi_latihan', 'waktu_mulai_subtes')) {
                    $table->dateTime('waktu_mulai_subtes')->nullable()->after('subtes_aktif')
                          ->comment('Timestamp kapan subtes aktif ini mulai dikerjakan');
                }
                if (!Schema::hasColumn('sesi_latihan', 'sisa_detik_subtes')) {
                    $table->integer('sisa_detik_subtes')->nullable()->after('waktu_mulai_subtes')
                          ->comment('Sisa detik subtes saat di-pause');
                }
                if (!Schema::hasColumn('sesi_latihan', 'is_paused')) {
                    $table->boolean('is_paused')->default(false)->after('sisa_detik_subtes')
                          ->comment('Apakah pengerjaan tryout sedang di-pause');
                }
                if (!Schema::hasColumn('sesi_latihan', 'subtes_selesai')) {
                    $table->json('subtes_selesai')->nullable()->after('is_paused')
                          ->comment('Daftar kode subtes yang sudah diselesaikan dan dikunci');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sesi_latihan')) {
            Schema::table('sesi_latihan', function (Blueprint $table) {
                $cols = ['subtes_aktif', 'waktu_mulai_subtes', 'sisa_detik_subtes', 'is_paused', 'subtes_selesai'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('sesi_latihan', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
