<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    public function index(Request $request)
    {
        $kegiatans = Kegiatan::orderBy('tanggal', 'desc')->get();
        return Inertia::render('Admin/Kegiatan/Index', [
            'kegiatans' => $kegiatans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Kegiatan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tanggal' => 'nullable|date',
            'waktu_mulai' => 'nullable|date_format:H:i',
            'waktu_selesai' => 'nullable|date_format:H:i',
            'status' => 'nullable|string|max:30',
        ]);

        if ($request->hasFile('gambar')) {
            $path = $request->file('gambar')->store('kegiatan');
            $validated['gambar'] = $path;
        }

        Kegiatan::create($validated);

        return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    public function edit(string $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        return Inertia::render('Admin/Kegiatan/Edit', [
            'kegiatan' => $kegiatan
        ]);
    }

    public function update(Request $request, string $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tanggal' => 'nullable|date',
            'waktu_mulai' => 'nullable|date_format:H:i',
            'waktu_selesai' => 'nullable|date_format:H:i',
            'status' => 'nullable|string|max:30',
        ]);

        if ($request->hasFile('gambar')) {

            // Hapus gambar lama
            if ($kegiatan->gambar) {
                try {
                    Storage::delete($kegiatan->gambar);
                } catch (\Throwable $e) {
                    // Abaikan jika gambar lama gagal dihapus
                }
            }

            // Upload gambar baru
            $path = $request->file('gambar')->store('kegiatan');

            // Simpan path gambar baru
            $validated['gambar'] = $path;

        } else {
            unset($validated['gambar']);
        }

        $kegiatan->update($validated);

        return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        // Hapus file gambar jika ada
        if ($kegiatan->gambar) {
            try {
                if (Storage::exists($kegiatan->gambar)) {
                    Storage::delete($kegiatan->gambar);
                }
            } catch (\Throwable $e) {
                // Skip jika file tidak ditemukan
            }
        }

        $kegiatan->delete();

        return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil dihapus.');
    }

    /**
     * Menerima unggahan gambar dari Tiptap editor,
     * menyimpannya ke storage, dan mengembalikan URL-nya.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $path = $request->file('image')->store('kegiatan/editor');

        // Kembalikan URL yang bisa langsung dipakai Tiptap
        $url = Storage::url($path);

        return response()->json(['url' => $url]);
    }
}
