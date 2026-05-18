<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Admins: " . App\Models\Admin::count() . " - " . App\Models\Admin::pluck('email')->implode(', ') . "\n";
echo "Siswas: " . App\Models\Siswa::count() . " - " . App\Models\Siswa::pluck('email')->implode(', ') . "\n";
