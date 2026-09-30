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
        if (Schema::hasTable('siswa')) {
            Schema::table('siswa', function (Blueprint $table) {
                if (!Schema::hasColumn('siswa', 'batch')) {
                    $table->string('batch', 50)->nullable()->after('target_kampus');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('siswa')) {
            Schema::table('siswa', function (Blueprint $table) {
                if (Schema::hasColumn('siswa', 'batch')) {
                    $table->dropColumn('batch');
                }
            });
        }
    }
};
