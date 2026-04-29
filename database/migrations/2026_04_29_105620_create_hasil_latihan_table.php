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
        Schema::create('hasil_latihan', function (Blueprint $table) {
            $table->id('id_hasil');
            $table->unsignedBigInteger('id_sesi')->nullable();
            $table->integer('total_soal')->nullable();
            $table->integer('jumlah_benar')->nullable();
            $table->integer('jumlah_salah')->nullable();
            $table->decimal('nilai_akhir', 5, 2)->nullable();

            $table->foreign('id_sesi')->references('id_sesi')->on('sesi_latihan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hasil_latihan');
    }
};
