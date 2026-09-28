<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'no_handphone' => ['nullable', 'string', 'max:20'],
            'asal_sekolah' => ['nullable', 'string', 'max:150'],
            'target_kampus' => ['nullable', 'string', 'max:150'],
            'foto_profil' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'hapus_foto' => ['nullable', 'boolean'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:100',
                Rule::unique(\App\Models\Siswa::class, 'email')->ignore($this->user()->id_siswa, 'id_siswa'),
            ],
            'current_password' => ['nullable', 'required_with:password', 'current_password'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email sudah digunakan oleh akun lain.',
            'foto_profil.image' => 'File foto profil harus berupa gambar.',
            'foto_profil.mimes' => 'Format foto profil harus JPG, PNG, atau WEBP.',
            'foto_profil.max' => 'Ukuran foto profil maksimal 2MB.',
            'current_password.required_with' => 'Kata sandi saat ini wajib diisi jika ingin mengubah kata sandi.',
            'current_password.current_password' => 'Kata sandi saat ini tidak cocok.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ];
    }
}
