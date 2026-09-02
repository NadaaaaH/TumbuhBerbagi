<?php

namespace App\Http\Requests\Admin\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class StoreSiswaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->guard('admin')->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:siswa,email'],
            'password' => ['required', 'string', 'min:8'],
            'no_handphone' => ['nullable', 'string', 'max:20'],
            'status_akun' => ['required', 'string', 'max:30'],
        ];
    }
}
