<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use Notifiable;

    protected $table = 'admin';
    protected $primaryKey = 'id_admin';
    public $timestamps = false;

    protected $fillable = [
        'nama',
        'email',
        'password',
        'no_handphone',
    ];

    protected $hidden = [
        'password',
        'pin_hash',
        'email_pending',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
