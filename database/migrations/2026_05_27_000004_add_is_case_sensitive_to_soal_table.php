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
        Schema::table('soal', function (Blueprint $table) {
            if (!Schema::hasColumn('soal', 'is_case_sensitive')) {
                $table->boolean('is_case_sensitive')->default(false)->after('bobot_nilai');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('soal', function (Blueprint $table) {
            if (Schema::hasColumn('soal', 'is_case_sensitive')) {
                $table->dropColumn('is_case_sensitive');
            }
        });
    }
};
