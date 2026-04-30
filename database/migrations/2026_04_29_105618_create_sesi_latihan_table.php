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
        Schema::create('sesi_latihan', function (Blueprint $table) {
            $table->id('id_sesi');
            $table->unsignedBigInteger('id_siswa')->nullable();
            $table->unsignedBigInteger('id_paket')->nullable();
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->string('status', 30)->nullable();

            $table->foreign('id_siswa')->references('id_siswa')->on('siswa');
            $table->foreign('id_paket')->references('id_paket')->on('paket_latihan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesi_latihan');
    }
};
