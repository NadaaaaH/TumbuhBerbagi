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
                if (!Schema::hasColumn('siswa', 'asal_sekolah')) {
                    $table->string('asal_sekolah', 150)->nullable()->after('no_handphone');
                }
                if (!Schema::hasColumn('siswa', 'target_kampus')) {
                    $table->string('target_kampus', 150)->nullable()->after('asal_sekolah');
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
                $columns = [];
                if (Schema::hasColumn('siswa', 'asal_sekolah')) {
                    $columns[] = 'asal_sekolah';
                }
                if (Schema::hasColumn('siswa', 'target_kampus')) {
                    $columns[] = 'target_kampus';
                }
                if (!empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};
