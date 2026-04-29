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
        Schema::create('jawaban_siswa', function (Blueprint $table) {
            $table->id('id_jawaban');
            $table->unsignedBigInteger('id_sesi')->nullable();
            $table->unsignedBigInteger('id_soal')->nullable();
            $table->unsignedBigInteger('id_pilihan')->nullable();

            $table->foreign('id_sesi')->references('id_sesi')->on('sesi_latihan')->onDelete('cascade');
            $table->foreign('id_soal')->references('id_soal')->on('soal');
            $table->foreign('id_pilihan')->references('id_pilihan')->on('pilihan_jawaban');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jawaban_siswa');
    }
};
