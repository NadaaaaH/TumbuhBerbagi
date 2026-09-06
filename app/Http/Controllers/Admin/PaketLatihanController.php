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

        if ($request->has('kategori') && $request->kategori != '') {
            $query->where('kategori', $request->kategori);
        }

        $soals = $query->get();

        return Inertia::render('Admin/PaketLatihan/Show', [
            'paket' => $paket,
            'soals' => $soals,
            'filters' => $request->only(['search', 'kategori'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'tipe' => 'required|string|in:latihan,tryout',
            'status' => 'required|in:aktif,nonaktif',
            'waktu_ujian' => 'required|integer|min:0',
        ]);

        $paket = PaketLatihan::create($validated);

        if ($paket->status === 'aktif') {
            $siswas = \App\Models\Siswa::all();
            $labelNotif = $paket->tipe === 'tryout' ? 'Try Out' : 'Latihan Soal';
            foreach ($siswas as $siswa) {
                \App\Models\Notifikasi::create([
                    'id_siswa' => $siswa->id_siswa,
                    'judul' => $labelNotif . ' Baru',
                    'pesan' => 'Paket ' . strtolower($labelNotif) . ' baru "' . $paket->nama_paket . '" sekarang sudah aktif. Yuk dikerjakan!',
                    'tipe' => $paket->tipe === 'tryout' ? 'tryout' : 'latihan',
                    'id_referensi' => $paket->id_paket,
                    'is_dibaca' => false,
                ]);
            }
        }

        return redirect()->route('paket-latihan.index')->with('success', 'Paket Paket berhasil dibuat.');
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
            'tipe' => 'required|string|in:latihan,tryout',
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

        DB::beginTransaction();
        try {
            // Cari semua soal di dalam paket ini
            $soalIds = DB::table('soal')->where('id_paket', $paket->id_paket)->pluck('id_soal')->toArray();

            // Cari semua sesi latihan untuk paket ini
            $sesiIds = DB::table('sesi_latihan')->where('id_paket', $paket->id_paket)->pluck('id_sesi')->toArray();

            if (!empty($sesiIds)) {
                // Hapus laporan, hasil_latihan, dan jawaban_siswa yang terhubung dengan sesi latihan ini
                DB::table('laporan')->whereIn('id_sesi', $sesiIds)->delete();
                DB::table('hasil_latihan')->whereIn('id_sesi', $sesiIds)->delete();
                DB::table('jawaban_siswa')->whereIn('id_sesi', $sesiIds)->delete();

                // Hapus sesi_latihan
                DB::table('sesi_latihan')->whereIn('id_sesi', $sesiIds)->delete();
            }

            if (!empty($soalIds)) {
                // Hapus jawaban siswa yang terhubung dengan soal-soal ini
                DB::table('jawaban_siswa')->whereIn('id_soal', $soalIds)->delete();

                // Hapus pilihan jawaban untuk soal-soal ini
                DB::table('pilihan_jawaban')->whereIn('id_soal', $soalIds)->delete();

                // Hapus soal-soal ini
                DB::table('soal')->whereIn('id_soal', $soalIds)->delete();
            }

            // Hapus notifikasi yang merujuk ke paket latihan ini
            DB::table('notifikasi')->where('tipe', 'latihan')->where('id_referensi', $paket->id_paket)->delete();

            // Hapus paket latihan
            $paket->delete();

            DB::commit();
            return redirect()->route('paket-latihan.index')->with('success', 'Paket Latihan berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus paket latihan: ' . $e->getMessage()]);
        }
    }
}
