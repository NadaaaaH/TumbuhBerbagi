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
        if (Schema::hasTable('siswa')) {
            Schema::table('siswa', function (Blueprint $table) {
                if (!Schema::hasColumn('siswa', 'foto_profil')) {
                    $table->string('foto_profil', 255)->nullable()->after('target_kampus');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('siswa')) {
            Schema::table('siswa', function (Blueprint $table) {
                if (Schema::hasColumn('siswa', 'foto_profil')) {
                    $table->dropColumn('foto_profil');
                }
            });
        }
    }
};
