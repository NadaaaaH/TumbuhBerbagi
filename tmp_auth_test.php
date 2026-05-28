<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Siswa;

$email = 'sausan@gmail.com';
$password = '12345678';

$s = Siswa::where('email', $email)->first();
if (!$s) {
    echo "NOT FOUND\n";
    exit(0);
}

echo "FOUND\n";
echo "password hash=" . $s->password . "\n";
echo "hash check=" . (Hash::check($password, $s->password) ? 'true' : 'false') . "\n";
echo "attempt siswa=" . (Auth::guard('siswa')->attempt(['email' => $email, 'password' => $password]) ? 'true' : 'false') . "\n";
echo "attempt admin=" . (Auth::guard('admin')->attempt(['email' => $email, 'password' => $password]) ? 'true' : 'false') . "\n";
