<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin', function (Blueprint $table) {
            $table->string('pin_hash')->nullable();
            $table->string('email_pending', 100)->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('admin', function (Blueprint $table) {
            $table->dropUnique(['email_pending']);
            $table->dropColumn(['pin_hash', 'email_pending']);
        });
    }
};
