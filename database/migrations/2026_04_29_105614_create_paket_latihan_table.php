<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paket_latihan', function (Blueprint $table) {
            $table->id('id_paket');
            $table->string('nama_paket', 150);
            $table->text('deskripsi')->nullable();
            $table->string('status', 30)->default('aktif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paket_latihan');
    }
};
