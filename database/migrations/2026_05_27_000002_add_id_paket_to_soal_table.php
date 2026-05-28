<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('soal', function (Blueprint $table) {
            if (!Schema::hasColumn('soal', 'id_paket')) {
                $table->unsignedBigInteger('id_paket')->nullable()->after('id_soal');
                $table->foreign('id_paket')->references('id_paket')->on('paket_latihan')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('soal', function (Blueprint $table) {
            if (Schema::hasColumn('soal', 'id_paket')) {
                $table->dropForeign(['id_paket']);
                $table->dropColumn('id_paket');
            }
        });
    }
};
