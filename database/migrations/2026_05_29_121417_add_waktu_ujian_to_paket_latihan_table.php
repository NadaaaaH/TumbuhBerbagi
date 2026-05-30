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
        Schema::table('paket_latihan', function (Blueprint $table) {
            $table->integer('waktu_ujian')->default(0)->after('deskripsi')->comment('Waktu ujian dalam menit, 0 = tak terbatas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paket_latihan', function (Blueprint $table) {
            $table->dropColumn('waktu_ujian');
        });
    }
};
