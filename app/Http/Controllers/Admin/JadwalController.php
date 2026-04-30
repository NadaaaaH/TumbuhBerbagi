<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index()
    {
        $jadwals = Jadwal::orderBy('tanggal', 'desc')->orderBy('waktu_mulai', 'desc')->get();
        return Inertia::render('Admin/Jadwal/Index', [
            'jadwals' => $jadwals
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Jadwal/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_jadwal' => 'required|string|max:100',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'nullable',
            'status' => 'nullable|in:aktif,nonaktif',
        ]);

        Jadwal::create($validated);

        return redirect()->route('jadwal.index')->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function edit(string $id)
    {
        $jadwal = Jadwal::findOrFail($id);
        return Inertia::render('Admin/Jadwal/Edit', [
            'jadwal' => $jadwal
        ]);
    }

    public function update(Request $request, string $id)
    {
        $jadwal = Jadwal::findOrFail($id);

        $validated = $request->validate([
            'nama_jadwal' => 'required|string|max:100',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'nullable',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $jadwal->update($validated);

        return redirect()->route('jadwal.index')->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $jadwal->delete();

        return redirect()->route('jadwal.index')->with('success', 'Jadwal berhasil dihapus.');
    }
}
