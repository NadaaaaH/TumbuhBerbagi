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
        Schema::create('aktivitas_siswa', function (Blueprint $table) {
            $table->id('id_aktivitas');
            $table->unsignedBigInteger('id_siswa')->nullable();
            $table->string('tipe_aktivitas', 50); // login, mulai_latihan, selesai_latihan
            $table->text('deskripsi');
            $table->timestamps();

            $table->foreign('id_siswa')->references('id_siswa')->on('siswa')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aktivitas_siswa');
    }
};
