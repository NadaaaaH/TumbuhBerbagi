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
            $table->text('konten_soal')->nullable();
            $table->string('kategori', 50)->nullable();
            $table->string('tingkat_kesulitan', 30)->nullable();
            $table->string('kunci_jawaban', 10)->nullable();
            $table->integer('bobot_nilai')->nullable();
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
