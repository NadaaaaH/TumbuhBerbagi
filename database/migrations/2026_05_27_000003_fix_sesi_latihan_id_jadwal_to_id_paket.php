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
        if (Schema::hasColumn('sesi_latihan', 'id_jadwal')) {
            Schema::table('sesi_latihan', function (Blueprint $table) {
                // Drop foreign key referencing jadwal
                $table->dropForeign('sesi_latihan_id_jadwal_foreign');
                
                // Rename column id_jadwal to id_paket
                $table->renameColumn('id_jadwal', 'id_paket');
            });

            Schema::table('sesi_latihan', function (Blueprint $table) {
                // Add foreign key referencing paket_latihan
                $table->foreign('id_paket')->references('id_paket')->on('paket_latihan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('sesi_latihan', 'id_paket')) {
            Schema::table('sesi_latihan', function (Blueprint $table) {
                $table->dropForeign('sesi_latihan_id_paket_foreign');
                $table->renameColumn('id_paket', 'id_jadwal');
            });

            Schema::table('sesi_latihan', function (Blueprint $table) {
                $table->foreign('id_jadwal')->references('id_jadwal')->on('jadwal');
            });
        }
    }
};
