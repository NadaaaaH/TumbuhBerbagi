<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Siswa::query();

        if ($request->has('search') && $request->search != '') {
            $searchTerm = '%' . strtolower($request->search) . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where(DB::raw('LOWER(nama)'), 'like', $searchTerm)
                  ->orWhere(DB::raw('LOWER(email)'), 'like', $searchTerm);
            });
        }

        $siswas = $query->orderBy('id_siswa', 'desc')->get();
        
        return Inertia::render('Admin/Siswa/Index', [
            'siswas' => $siswas,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Siswa/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:siswa,email'],
            'password' => ['required', 'string', 'min:8'],
            'no_handphone' => ['nullable', 'string', 'max:20'],
            'status_akun' => ['required', 'string', 'max:30'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = null; // Terisi otomatis ketika tautan verifikasi diklik
        $validated['force_password_change'] = true; // Paksa ganti password pertama kali setelah verifikasi

        $siswa = Siswa::create($validated);

        try {
            $siswa->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            // Log the error but allow registration to complete if mail server has issues locally
            \Illuminate\Support\Facades\Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return redirect()->route('siswa.index')->with('success', 'Siswa berhasil ditambahkan dan email verifikasi telah dikirim.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $siswa = Siswa::findOrFail($id);

        return Inertia::render('Admin/Siswa/Edit', [
            'siswa' => $siswa
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $siswa = Siswa::findOrFail($id);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:siswa,email,' . $siswa->id_siswa . ',id_siswa'],
            'password' => ['nullable', 'string', 'min:8'],
            'no_handphone' => ['nullable', 'string', 'max:20'],
            'status_akun' => ['required', 'string', 'max:30'],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $siswa->update($validated);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->delete();

        return redirect()->route('siswa.index')->with('success', 'Siswa berhasil dihapus.');
    }
}
