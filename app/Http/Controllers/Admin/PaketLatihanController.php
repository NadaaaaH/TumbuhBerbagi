<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaketLatihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaketLatihanController extends Controller
{
    public function index(Request $request)
    {
        $query = PaketLatihan::withCount('soal');

        if ($request->has('search') && $request->search != '') {
            $searchTerm = '%' . strtolower($request->search) . '%';
            $query->where(DB::raw('LOWER(nama_paket)'), 'like', $searchTerm);
        }

        $pakets = $query->orderBy('id_paket', 'desc')->get();
        
        return Inertia::render('Admin/PaketLatihan/Index', [
            'pakets' => $pakets,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/PaketLatihan/Create');
    }

    public function show(Request $request, string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        
        // Ambil soal-soal yang ada di paket ini
        $query = \App\Models\Soal::with('pilihan_jawaban')
            ->where('id_paket', $id)
            ->orderBy('id_soal', 'desc');

        if ($request->has('search') && $request->search != '') {
            $query->where(DB::raw('LOWER(konten_soal)'), 'like', '%' . strtolower($request->search) . '%');
        }

        $soals = $query->get();

        return Inertia::render('Admin/PaketLatihan/Show', [
            'paket' => $paket,
            'soals' => $soals,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'status' => 'required|in:aktif,nonaktif',
            'waktu_ujian' => 'required|integer|min:0',
        ]);

        $paket = PaketLatihan::create($validated);

        if ($paket->status === 'aktif') {
            $siswas = \App\Models\Siswa::all();
            foreach ($siswas as $siswa) {
                \App\Models\Notifikasi::create([
                    'id_siswa' => $siswa->id_siswa,
                    'judul' => 'Latihan Soal Baru',
                    'pesan' => 'Paket latihan baru "' . $paket->nama_paket . '" sekarang sudah aktif. Yuk dikerjakan!',
                    'tipe' => 'latihan',
                    'id_referensi' => $paket->id_paket,
                    'is_dibaca' => false,
                ]);
            }
        }

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
            'waktu_ujian' => 'required|integer|min:0',
        ]);

        $oldStatus = $paket->status;
        $paket->update($validated);

        if ($paket->status === 'aktif' && $oldStatus !== 'aktif') {
            $siswas = \App\Models\Siswa::all();
            foreach ($siswas as $siswa) {
                // Hindari duplikasi notifikasi untuk paket yang sama jika sudah ada
                $exists = \App\Models\Notifikasi::where('id_siswa', $siswa->id_siswa)
                    ->where('tipe', 'latihan')
                    ->where('id_referensi', $paket->id_paket)
                    ->exists();
                
                if (!$exists) {
                    \App\Models\Notifikasi::create([
                        'id_siswa' => $siswa->id_siswa,
                        'judul' => 'Latihan Soal Baru',
                        'pesan' => 'Paket latihan baru "' . $paket->nama_paket . '" sekarang sudah aktif. Yuk dikerjakan!',
                        'tipe' => 'latihan',
                        'id_referensi' => $paket->id_paket,
                        'is_dibaca' => false,
                    ]);
                }
            }
        }

        return redirect()->route('paket-latihan.index')->with('success', 'Paket Latihan berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        $paket->delete();

        return redirect()->route('paket-latihan.index')->with('success', 'Paket Latihan berhasil dihapus.');
    }
}
