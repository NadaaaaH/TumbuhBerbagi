<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Siswa;

class DummyUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::create([
            'nama' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'no_handphone' => '081234567890',
        ]);

        Siswa::create([
            'nama' => 'Siswa Teladan',
            'email' => 'siswa@example.com',
            'password' => Hash::make('password'),
            'no_handphone' => '089876543210',
            'asal_sekolah' => 'SMAN 1 Bandung',
            'target_kampus' => 'Institut Teknologi Bandung',
            'status_akun' => 'Aktif',
        ]);
    }
}
