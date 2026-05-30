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
        Schema::create('statistik_pengunjung', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->unique();
            $table->integer('jumlah_siswa')->default(0);
            $table->integer('jumlah_tamu')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statistik_pengunjung');
    }
};
