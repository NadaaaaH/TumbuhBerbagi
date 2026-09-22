<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('paket_soal')) {
            Schema::table('paket_soal', function (Blueprint $table) {
                if (!Schema::hasColumn('paket_soal', 'subtes')) {
                    $table->string('subtes', 20)->nullable()->after('id_soal')
                          ->comment('Subtes UTBK: PU, PPU, PK, PBM, LBI, LBIng, PM — null untuk latihan soal');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('paket_soal')) {
            Schema::table('paket_soal', function (Blueprint $table) {
                if (Schema::hasColumn('paket_soal', 'subtes')) {
                    $table->dropColumn('subtes');
                }
            });
        }
    }
};
