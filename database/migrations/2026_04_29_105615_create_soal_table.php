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
        Schema::create('soal', function (Blueprint $table) {
            $table->id('id_soal');
            $table->unsignedBigInteger('id_paket')->nullable();
            $table->text('konten_soal')->nullable();
            $table->string('jenis_soal', 30)->default('pilihan_ganda');
            $table->string('kategori', 50)->nullable();
            $table->string('tingkat_kesulitan', 30)->nullable();
            $table->text('kunci_jawaban')->nullable();
            $table->integer('bobot_nilai')->default(10);
            $table->boolean('is_case_sensitive')->default(false);
            $table->string('status', 30)->default('aktif');

            $table->foreign('id_paket')->references('id_paket')->on('paket_latihan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soal');
    }
};
