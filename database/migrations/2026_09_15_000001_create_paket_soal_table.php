<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Buat tabel pivot paket_soal
        Schema::create('paket_soal', function (Blueprint $table) {
            $table->unsignedBigInteger('id_paket');
            $table->unsignedBigInteger('id_soal');

            $table->foreign('id_paket')->references('id_paket')->on('paket_latihan')->onDelete('cascade');
            $table->foreign('id_soal')->references('id_soal')->on('soal')->onDelete('cascade');

            $table->primary(['id_paket', 'id_soal']);
        });

        // 2. Migrasikan data yang sudah ada dari kolom soal.id_paket ke pivot tabel paket_soal
        $existingSoal = DB::table('soal')->whereNotNull('id_paket')->get(['id_soal', 'id_paket']);
        $insertData = [];
        foreach ($existingSoal as $s) {
            $paketExists = DB::table('paket_latihan')->where('id_paket', $s->id_paket)->exists();
            if ($paketExists) {
                $insertData[] = [
                    'id_paket' => $s->id_paket,
                    'id_soal' => $s->id_soal,
                ];
            }
        }

        if (!empty($insertData)) {
            DB::table('paket_soal')->insertOrIgnore($insertData);
        }

        // 3. Buat kolom id_paket di tabel soal menjadi nullable jika belum nullable
        Schema::table('soal', function (Blueprint $table) {
            $table->unsignedBigInteger('id_paket')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_soal');
    }
};
