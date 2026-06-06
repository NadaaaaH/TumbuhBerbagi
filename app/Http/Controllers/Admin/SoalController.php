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
            'bobot_nilai' => 10,
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
            'referrer' => url()->previous(),
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
                'bobot_nilai' => $soal->bobot_nilai ?? 10,
                'is_case_sensitive' => $validated['is_case_sensitive'] ?? false,
                'status' => $validated['status'],
            ]);

            // Perbarui atau buat pilihan jawaban jika pilihan ganda
            if ($validated['jenis_soal'] === 'pilihan_ganda' && !empty($validated['pilihan'])) {
                foreach ($validated['pilihan'] as $pilihan) {
                    PilihanJawaban::updateOrCreate(
                        [
                            'id_soal' => $soal->id_soal,
                            'kode_pilihan' => $pilihan['kode_pilihan']
                        ],
                        [
                            'teks_pilihan' => $pilihan['teks_pilihan']
                        ]
                    );
                }

                // Hapus pilihan lain yang mungkin ada (jika kode_pilihan tidak ada dalam input pilihan)
                $inputCodes = collect($validated['pilihan'])->pluck('kode_pilihan')->toArray();
                PilihanJawaban::where('id_soal', $soal->id_soal)
                    ->whereNotIn('kode_pilihan', $inputCodes)
                    ->delete();
            } else {
                // Jika jenis soal berubah menjadi isian, hapus pilihan jawaban (hanya jika tidak dirujuk, tapi jika dirujuk kita harus set id_pilihan ke null di jawaban_siswa dahulu)
                $pilihanIds = PilihanJawaban::where('id_soal', $soal->id_soal)->pluck('id_pilihan')->toArray();
                if (!empty($pilihanIds)) {
                    DB::table('jawaban_siswa')->whereIn('id_pilihan', $pilihanIds)->update(['id_pilihan' => null]);
                    PilihanJawaban::where('id_soal', $soal->id_soal)->delete();
                }
            }

            DB::commit();

            $redirectTo = $request->input('redirect_to');
            if ($redirectTo && (str_contains($redirectTo, '/soal') || str_contains($redirectTo, '/paket-latihan'))) {
                return redirect($redirectTo)->with('success', 'Soal berhasil diperbarui.');
            }

            return redirect()->route('paket-latihan.show', $soal->id_paket)->with('success', 'Soal berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui soal: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        $soal = Soal::findOrFail($id);
        $id_paket = $soal->id_paket;

        DB::beginTransaction();
        try {
            // Hapus jawaban siswa yang merujuk ke soal ini
            DB::table('jawaban_siswa')->where('id_soal', $soal->id_soal)->delete();

            // Hapus pilihan jawaban yang merujuk ke soal ini
            PilihanJawaban::where('id_soal', $soal->id_soal)->delete();

            // Hapus soal
            $soal->delete();

            DB::commit();
            return redirect()->route('paket-latihan.show', $id_paket)->with('success', 'Soal berhasil dihapus dari paket.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus soal: ' . $e->getMessage()]);
        }
    }

    public function toggleStatus(string $id)
    {
        $soal = Soal::findOrFail($id);
        $soal->status = $soal->status === 'aktif' ? 'nonaktif' : 'aktif';
        $soal->save();

        return back()->with('success', 'Status soal berhasil diubah.');
    }
}
