<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Soal;
use App\Models\PilihanJawaban;
use App\Models\PaketLatihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SoalController extends Controller
{
    public function index(Request $request)
    {
        $query = Soal::with(['pilihan_jawaban', 'paket_latihan'])->orderBy('id_soal', 'desc');

        if ($request->has('kategori') && $request->kategori != '') {
            $query->where('kategori', $request->kategori);
        }

        if ($request->has('id_paket') && $request->id_paket != '') {
            $query->where('id_paket', $request->id_paket);
        }

        if ($request->has('search') && $request->search != '') {
            $query->where(DB::raw('LOWER(konten_soal)'), 'like', '%' . strtolower($request->search) . '%');
        }

        $soals = $query->get();
        $pakets = PaketLatihan::orderBy('nama_paket')->get();

        return Inertia::render('Admin/Soal/Index', [
            'soals' => $soals,
            'pakets' => $pakets,
            'filters' => $request->only(['kategori', 'id_paket', 'search'])
        ]);
    }

    public function create(Request $request)
    {
        $pakets = PaketLatihan::orderBy('nama_paket')->get();
        return Inertia::render('Admin/Soal/Create', [
            'pakets' => $pakets,
            'defaultPaketId' => $request->query('paket_id', '')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_paket' => 'required|exists:paket_latihan,id_paket',
            'konten_soal' => 'required|string',
            'jenis_soal' => 'required|in:pilihan_ganda,isian',
            'kategori' => 'required|string|max:50',
            'tingkat_kesulitan' => 'nullable|string|max:30',
            'kunci_jawaban' => 'required|string',
            'pembahasan' => 'nullable|string',
            'bobot_nilai' => 'required|integer|min:1',
            'is_case_sensitive' => 'boolean',
            'status' => 'required|in:aktif,nonaktif',
            
            // Untuk jenis soal pilihan ganda
            'pilihan' => 'required_if:jenis_soal,pilihan_ganda|array',
            'pilihan.*.kode_pilihan' => 'required_if:jenis_soal,pilihan_ganda|string|max:5',
            'pilihan.*.teks_pilihan' => 'required_if:jenis_soal,pilihan_ganda|string',
        ]);

        DB::beginTransaction();
        try {
            $soal = Soal::create([
                'id_paket' => $validated['id_paket'],
                'konten_soal' => $validated['konten_soal'],
                'jenis_soal' => $validated['jenis_soal'],
                'kategori' => $validated['kategori'],
                'tingkat_kesulitan' => $validated['tingkat_kesulitan'] ?? 'medium',
                'kunci_jawaban' => $validated['kunci_jawaban'],
            'pembahasan' => $validated['pembahasan'] ?? null,
            'bobot_nilai' => $validated['bobot_nilai'] ?? 10,
            'is_case_sensitive' => $validated['is_case_sensitive'] ?? false,
            'status' => $validated['status'],
            ]);

            if ($validated['jenis_soal'] === 'pilihan_ganda' && !empty($validated['pilihan'])) {
                foreach ($validated['pilihan'] as $pilihan) {
                    PilihanJawaban::create([
                        'id_soal' => $soal->id_soal,
                        'kode_pilihan' => $pilihan['kode_pilihan'],
                        'teks_pilihan' => $pilihan['teks_pilihan'],
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('paket-latihan.show', $validated['id_paket'])->with('success', 'Soal berhasil ditambahkan ke paket ini.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan soal: ' . $e->getMessage()]);
        }
    }

    public function edit(string $id)
    {
        $soal = Soal::with('pilihan_jawaban')->findOrFail($id);
        $pakets = PaketLatihan::orderBy('nama_paket')->get();
        return Inertia::render('Admin/Soal/Edit', [
            'soal' => $soal,
            'pakets' => $pakets,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $soal = Soal::findOrFail($id);

        $validated = $request->validate([
            'id_paket' => 'required|exists:paket_latihan,id_paket',
            'konten_soal' => 'required|string',
            'jenis_soal' => 'required|in:pilihan_ganda,isian',
            'kategori' => 'required|string|max:50',
            'tingkat_kesulitan' => 'nullable|string|max:30',
            'kunci_jawaban' => 'required|string',
            'pembahasan' => 'nullable|string',
            'bobot_nilai' => 'required|integer|min:1',
            'is_case_sensitive' => 'boolean',
            'status' => 'required|in:aktif,nonaktif',
            
            'pilihan' => 'required_if:jenis_soal,pilihan_ganda|array',
            'pilihan.*.kode_pilihan' => 'required_if:jenis_soal,pilihan_ganda|string|max:5',
            'pilihan.*.teks_pilihan' => 'required_if:jenis_soal,pilihan_ganda|string',
        ]);

        DB::beginTransaction();
        try {
            $soal->update([
                'id_paket' => $validated['id_paket'],
                'konten_soal' => $validated['konten_soal'],
                'jenis_soal' => $validated['jenis_soal'],
                'kategori' => $validated['kategori'],
                'tingkat_kesulitan' => $validated['tingkat_kesulitan'] ?? $soal->tingkat_kesulitan,
                'kunci_jawaban' => $validated['kunci_jawaban'],
                'pembahasan' => $validated['pembahasan'] ?? null,
                'bobot_nilai' => $validated['bobot_nilai'],
                'is_case_sensitive' => $validated['is_case_sensitive'] ?? false,
                'status' => $validated['status'],
            ]);

            // Reset/Hapus pilihan jawaban lama
            PilihanJawaban::where('id_soal', $soal->id_soal)->delete();

            // Masukkan pilihan jawaban baru jika pilihan ganda
            if ($validated['jenis_soal'] === 'pilihan_ganda' && !empty($validated['pilihan'])) {
                foreach ($validated['pilihan'] as $pilihan) {
                    PilihanJawaban::create([
                        'id_soal' => $soal->id_soal,
                        'kode_pilihan' => $pilihan['kode_pilihan'],
                        'teks_pilihan' => $pilihan['teks_pilihan'],
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('paket-latihan.show', $soal->id_paket)->with('success', 'Soal berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui soal: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        $soal = Soal::findOrFail($id);
        // Karena di migrasi belum ada onDelete('cascade') untuk pilihan_jawaban,
        // kita hapus manual untuk aman.
        $id_paket = $soal->id_paket;
        PilihanJawaban::where('id_soal', $soal->id_soal)->delete();
        $soal->delete();

        return redirect()->route('paket-latihan.show', $id_paket)->with('success', 'Soal berhasil dihapus dari paket.');
    }

    public function toggleStatus(string $id)
    {
        $soal = Soal::findOrFail($id);
        $soal->status = $soal->status === 'aktif' ? 'nonaktif' : 'aktif';
        $soal->save();

        return back()->with('success', 'Status soal berhasil diubah.');
    }
}
