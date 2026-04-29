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
        Schema::create('laporan', function (Blueprint $table) {
            $table->id('id_laporan');
            $table->unsignedBigInteger('id_sesi')->nullable();
            $table->string('periode', 50)->nullable();
            $table->integer('total_siswa')->nullable();
            $table->decimal('nilai_terendah', 5, 2)->nullable();
            $table->decimal('nilai_tertinggi', 5, 2)->nullable();
            $table->decimal('nilai_rata_rata', 5, 2)->nullable();
            $table->date('tanggal_cetak')->nullable();

            $table->foreign('id_sesi')->references('id_sesi')->on('sesi_latihan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan');
    }
};
