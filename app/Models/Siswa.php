<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Support\Facades\Storage;

class Siswa extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, MustVerifyEmailTrait;

    protected $table = 'siswa';
    protected $primaryKey = 'id_siswa';
    public $timestamps = false;

    protected $fillable = [
        'nama',
        'email',
        'password',
        'no_handphone',
        'asal_sekolah',
        'target_kampus',
        'batch',
        'foto_profil',
        'status_akun',
        'email_verified_at',
        'force_password_change',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = [
        'foto_profil_url',
    ];

    public function getFotoProfilUrlAttribute(): ?string
    {
        if ($this->foto_profil) {
            if (filter_var($this->foto_profil, FILTER_VALIDATE_URL) || str_starts_with($this->foto_profil, 'http')) {
                return $this->foto_profil;
            }
            return Storage::url($this->foto_profil);
        }
        return null;
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'email_verified_at' => 'datetime',
            'force_password_change' => 'boolean',
        ];
    }
}

