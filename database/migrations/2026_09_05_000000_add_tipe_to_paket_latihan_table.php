<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('paket_latihan')) {
            Schema::table('paket_latihan', function (Blueprint $table) {
                if (!Schema::hasColumn('paket_latihan', 'tipe')) {
                    $table->string('tipe', 30)->default('latihan')->after('status');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('paket_latihan')) {
            Schema::table('paket_latihan', function (Blueprint $table) {
                if (Schema::hasColumn('paket_latihan', 'tipe')) {
                    $table->dropColumn('tipe');
                }
            });
        }
    }
};
