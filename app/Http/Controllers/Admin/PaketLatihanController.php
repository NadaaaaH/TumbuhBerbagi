<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaketLatihan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaketLatihanController extends Controller
{
    public function index()
    {
        $pakets = PaketLatihan::withCount('soal')->orderBy('id_paket', 'desc')->get();
        return Inertia::render('Admin/PaketLatihan/Index', [
            'pakets' => $pakets
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/PaketLatihan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        PaketLatihan::create($validated);

        return redirect()->route('paket-latihan.index')->with('success', 'Paket Latihan berhasil dibuat.');
    }

    public function edit(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        return Inertia::render('Admin/PaketLatihan/Edit', [
            'paket' => $paket
        ]);
    }

    public function update(Request $request, string $id)
    {
        $paket = PaketLatihan::findOrFail($id);

        $validated = $request->validate([
            'nama_paket' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $paket->update($validated);

        return redirect()->route('paket-latihan.index')->with('success', 'Paket Latihan berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        $paket->delete();

        return redirect()->route('paket-latihan.index')->with('success', 'Paket Latihan berhasil dihapus.');
    }
}
