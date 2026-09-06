<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('jadwal')) {
            Schema::table('jadwal', function (Blueprint $table) {
                if (!Schema::hasColumn('jadwal', 'deskripsi')) {
                    $table->text('deskripsi')->nullable()->after('nama_jadwal');
                }
                if (!Schema::hasColumn('jadwal', 'lokasi')) {
                    $table->string('lokasi', 255)->nullable()->after('deskripsi');
                }
                if (!Schema::hasColumn('jadwal', 'gambar')) {
                    $table->string('gambar', 255)->nullable()->after('lokasi');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('jadwal')) {
            Schema::table('jadwal', function (Blueprint $table) {
                if (Schema::hasColumn('jadwal', 'deskripsi')) {
                    $table->dropColumn(['deskripsi', 'lokasi', 'gambar']);
                }
            });
        }
    }
};
