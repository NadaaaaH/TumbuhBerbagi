<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $query = Jadwal::query();

        if ($request->has('search') && $request->search != '') {
            $searchTerm = '%' . strtolower($request->search) . '%';
            $query->where(DB::raw('LOWER(nama_jadwal)'), 'like', $searchTerm);
        }

        $jadwals = $query->orderBy('tanggal', 'desc')->orderBy('waktu_mulai', 'desc')->get();
        return Inertia::render('Admin/Jadwal/Index', [
            'jadwals' => $jadwals,
            'filters' => $request->only(['search'])
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
            'deskripsi'   => 'nullable|string|max:1000',
            'tanggal'     => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'nullable',
            'status'      => 'nullable|in:aktif,nonaktif',
            'gambar'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('jadwal', 'public');
        }

        $jadwal = Jadwal::create($validated);

        if ($jadwal->status === 'aktif') {
            $siswas = \App\Models\Siswa::all();
            foreach ($siswas as $siswa) {
                \App\Models\Notifikasi::create([
                    'id_siswa' => $siswa->id_siswa,
                    'judul' => 'Jadwal Mentoring Baru',
                    'pesan' => 'Jadwal mentoring baru "' . $jadwal->nama_jadwal . '" telah ditambahkan untuk tanggal ' . \Carbon\Carbon::parse($jadwal->tanggal)->translatedFormat('d F Y') . '.',
                    'tipe' => 'jadwal',
                    'id_referensi' => $jadwal->id_jadwal,
                    'is_dibaca' => false,
                ]);
            }
        }

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
            'deskripsi'   => 'nullable|string|max:1000',
            'tanggal'     => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'nullable',
            'status'      => 'required|in:aktif,nonaktif',
            'gambar'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Handle gambar baru
        if ($request->hasFile('gambar')) {
            // Hapus gambar lama jika ada
            if ($jadwal->gambar) {
                Storage::disk('public')->delete($jadwal->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('jadwal', 'public');
        } elseif ($request->input('remove_gambar')) {
            // Hapus gambar tanpa ganti
            if ($jadwal->gambar) {
                Storage::disk('public')->delete($jadwal->gambar);
            }
            $validated['gambar'] = null;
        } else {
            // Pertahankan gambar lama
            unset($validated['gambar']);
        }

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
