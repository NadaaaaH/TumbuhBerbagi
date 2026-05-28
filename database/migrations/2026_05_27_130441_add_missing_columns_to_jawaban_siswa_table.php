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
        Schema::table('jawaban_siswa', function (Blueprint $table) {
            if (!Schema::hasColumn('jawaban_siswa', 'teks_jawaban')) {
                $table->text('teks_jawaban')->nullable();
            }
            if (!Schema::hasColumn('jawaban_siswa', 'is_benar')) {
                $table->boolean('is_benar')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jawaban_siswa', function (Blueprint $table) {
            if (Schema::hasColumn('jawaban_siswa', 'teks_jawaban')) {
                $table->dropColumn('teks_jawaban');
            }
            if (Schema::hasColumn('jawaban_siswa', 'is_benar')) {
                $table->dropColumn('is_benar');
            }
        });
    }
};
