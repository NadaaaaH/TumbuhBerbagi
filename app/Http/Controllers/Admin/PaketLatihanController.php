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
        $tipe = $request->query('tipe');
        if ($tipe === 'tryout') {
            return $this->indexTryout($request);
        }
        return $this->indexLatihan($request);
    }

    public function indexTryout(Request $request)
    {
        $pakets = PaketLatihan::where('tipe', 'tryout')
            ->withCount('soal')
            ->orderBy('id_paket', 'desc')
            ->get();
        
        return Inertia::render('Admin/PaketLatihan/Index', [
            'pakets' => $pakets,
            'fixedTipe' => 'tryout',
        ]);
    }

    public function indexLatihan(Request $request)
    {
        $pakets = PaketLatihan::where('tipe', 'latihan')
            ->withCount('soal')
            ->orderBy('id_paket', 'desc')
            ->get();
        
        return Inertia::render('Admin/PaketLatihan/Index', [
            'pakets' => $pakets,
            'fixedTipe' => 'latihan',
        ]);
    }

    public function create()
    {
        return $this->createLatihan();
    }

    public function createTryout()
    {
        return Inertia::render('Admin/PaketLatihan/Create', [
            'defaultTipe' => 'tryout',
        ]);
    }

    public function createLatihan()
    {
        return Inertia::render('Admin/PaketLatihan/Create', [
            'defaultTipe' => 'latihan',
        ]);
    }

    public function show(Request $request, string $id)
    {
        $paket = PaketLatihan::findOrFail($id);
        
        // Ambil soal-soal yang ada di paket ini via many-to-many
        $query = $paket->soal()->with('pilihan_jawaban');

        if ($request->has('search') && $request->search != '') {
            $query->where(DB::raw('LOWER(konten_soal)'), 'like', '%' . strtolower($request->search) . '%');
        }

        if ($request->has('kategori') && $request->kategori != '') {
            $query->where('kategori', $request->kategori);
        }

        $soals = $query->orderBy('soal.id_soal', 'desc')->get();

        $existingIds = $soals->pluck('id_soal')->toArray();
        $bankSoals = \App\Models\Soal::whereNotIn('id_soal', $existingIds)
            ->where('status', 'aktif')
            ->orderBy('id_soal', 'desc')
            ->get(['id_soal', 'konten_soal', 'kategori', 'jenis_soal', 'materi', 'tingkat_kesulitan']);

        return Inertia::render('Admin/PaketLatihan/Show', [
            'paket'     => $paket,
            'soals'     => $soals,
            'bankSoals' => $bankSoals,
            'filters'   => $request->only(['search', 'kategori'])
        ]);
    }

    public function store(Request $request)
    {
        $isTryout = $request->input('tipe') === 'tryout';

        $validated = $request->validate([
            'nama_paket'           => 'required|string|max:150',
            'deskripsi'            => 'nullable|string',
            'tipe'                 => 'required|string|in:latihan,tryout',
            'status'               => 'required|in:aktif,nonaktif',
            'waktu_ujian'          => 'required|integer|min:0',
            'tanggal_aktif'        => 'nullable|date',
            // Tryout fields
            'tanggal_mulai'        => ($isTryout ? 'required' : 'nullable') . '|date',
            'tanggal_selesai'      => ($isTryout ? 'required' : 'nullable') . '|date|after:tanggal_mulai',
            'is_random'            => 'boolean',
            'bisa_pause'           => 'boolean',
            'tampil_hasil'         => 'in:setelah_selesai,terjadwal',
            'tanggal_tampil_hasil' => 'nullable|date|required_if:tampil_hasil,terjadwal',
        ]);

        // Kalau ada jadwal aktif
        if (!empty($validated['tanggal_aktif'])) {
            if (now()->gte($validated['tanggal_aktif'])) {
                $validated['status'] = 'aktif';
                $validated['tanggal_aktif'] = null;
            } else {
                $validated['status'] = 'nonaktif';
            }
        }

        // Kalau status manual aktif, hapus jadwal
        if ($validated['status'] === 'aktif') {
            $validated['tanggal_aktif'] = null;
        }

        // Bersihkan field tryout jika tipe = latihan, set standar 195 menit untuk tryout
        if ($isTryout) {
            $validated['waktu_ujian'] = 195;
        } else {
            $validated['tanggal_mulai']        = null;
            $validated['tanggal_selesai']      = null;
            $validated['is_random']            = false;
            $validated['bisa_pause']           = true;
            $validated['tampil_hasil']         = 'setelah_selesai';
            $validated['tanggal_tampil_hasil'] = null;
        }

        // Bersihkan tanggal tampil hasil jika bukan mode terjadwal
        if (($validated['tampil_hasil'] ?? '') !== 'terjadwal') {
            $validated['tanggal_tampil_hasil'] = null;
        }

        $paket = PaketLatihan::create($validated);

        if ($paket->status === 'aktif') {
            $siswas = \App\Models\Siswa::all();
            $labelNotif = $paket->tipe === 'tryout' ? 'Try Out' : 'Latihan Soal';
            foreach ($siswas as $siswa) {
                \App\Models\Notifikasi::create([
                    'id_siswa'     => $siswa->id_siswa,
                    'judul'        => $labelNotif . ' Baru',
                    'pesan'        => 'Paket ' . strtolower($labelNotif) . ' baru "' . $paket->nama_paket . '" sekarang sudah aktif. Yuk dikerjakan!',
                    'tipe'         => $paket->tipe === 'tryout' ? 'tryout' : 'latihan',
                    'id_referensi' => $paket->id_paket,
                    'is_dibaca'    => false,
                ]);
            }
        }

        return redirect()->route('paket-latihan.show', $paket->id_paket)->with('success', 'Paket berhasil dibuat! Sekarang tambahkan soal ke paket ini.');
    }

    public function edit(string $id)
    {
        $paket = PaketLatihan::withCount('soal')->findOrFail($id);
        $soals = $paket->soal()->orderBy('soal.id_soal', 'desc')->get();

        // Soal dari bank yang BELUM ada di paket ini
        $existingIds = $soals->pluck('id_soal')->toArray();
        $bankSoals = \App\Models\Soal::whereNotIn('id_soal', $existingIds)
            ->where('status', 'aktif')
            ->orderBy('id_soal', 'desc')
            ->get(['id_soal', 'konten_soal', 'kategori', 'jenis_soal', 'materi', 'tingkat_kesulitan']);

        return Inertia::render('Admin/PaketLatihan/Edit', [
            'paket'     => $paket,
            'soals'     => $soals,
            'bankSoals' => $bankSoals,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $paket    = PaketLatihan::findOrFail($id);
        $isTryout = $request->input('tipe') === 'tryout';

        $validated = $request->validate([
            'nama_paket'           => 'required|string|max:150',
            'deskripsi'            => 'nullable|string',
            'tipe'                 => 'required|string|in:latihan,tryout',
            'status'               => 'required|in:aktif,nonaktif',
            'waktu_ujian'          => 'required|integer|min:0',
            'tanggal_aktif'        => 'nullable|date',
            // Tryout fields
            'tanggal_mulai'        => ($isTryout ? 'required' : 'nullable') . '|date',
            'tanggal_selesai'      => ($isTryout ? 'required' : 'nullable') . '|date|after:tanggal_mulai',
            'is_random'            => 'boolean',
            'bisa_pause'           => 'boolean',
            'tampil_hasil'         => 'in:setelah_selesai,terjadwal',
            'tanggal_tampil_hasil' => 'nullable|date|required_if:tampil_hasil,terjadwal',
        ]);

        // Kalau ada jadwal aktif
        if (!empty($validated['tanggal_aktif'])) {
            if (now()->gte($validated['tanggal_aktif'])) {
                $validated['status'] = 'aktif';
                $validated['tanggal_aktif'] = null;
            } else {
                $validated['status'] = 'nonaktif';
            }
        }

        // Kalau status manual aktif, hapus jadwal
        if ($validated['status'] === 'aktif') {
            $validated['tanggal_aktif'] = null;
        }

        // Bersihkan field tryout jika tipe = latihan, set standar 195 menit untuk tryout
        if ($isTryout) {
            $validated['waktu_ujian'] = 195;
        } else {
            $validated['tanggal_mulai']        = null;
            $validated['tanggal_selesai']      = null;
            $validated['is_random']            = false;
            $validated['bisa_pause']           = true;
            $validated['tampil_hasil']         = 'setelah_selesai';
            $validated['tanggal_tampil_hasil'] = null;
        }

        // Bersihkan tanggal tampil hasil jika bukan mode terjadwal
        if (($validated['tampil_hasil'] ?? '') !== 'terjadwal') {
            $validated['tanggal_tampil_hasil'] = null;
        }

        $oldStatus = $paket->status;
        $paket->update($validated);

        if ($paket->status === 'aktif' && $oldStatus !== 'aktif') {
            $siswas     = \App\Models\Siswa::all();
            $labelNotif = $paket->tipe === 'tryout' ? 'Try Out' : 'Latihan Soal';
            foreach ($siswas as $siswa) {
                $exists = \App\Models\Notifikasi::where('id_siswa', $siswa->id_siswa)
                    ->where('tipe', $paket->tipe === 'tryout' ? 'tryout' : 'latihan')
                    ->where('id_referensi', $paket->id_paket)
                    ->exists();

                if (!$exists) {
                    \App\Models\Notifikasi::create([
                        'id_siswa'     => $siswa->id_siswa,
                        'judul'        => $labelNotif . ' Baru',
                        'pesan'        => 'Paket ' . strtolower($labelNotif) . ' "' . $paket->nama_paket . '" sekarang sudah aktif. Yuk dikerjakan!',
                        'tipe'         => $paket->tipe === 'tryout' ? 'tryout' : 'latihan',
                        'id_referensi' => $paket->id_paket,
                        'is_dibaca'    => false,
                    ]);
                }
            }
        }

        $targetRoute = $paket->tipe === 'tryout' ? 'paket-tryout.index' : 'paket-latihan.index';
        $label = $paket->tipe === 'tryout' ? 'Paket Try Out' : 'Paket Latihan';
        return redirect()->route($targetRoute)->with('success', $label . ' berhasil diperbarui.');
    }

    public function removeSoal(string $id_paket, string $id_soal)
    {
        $paket = PaketLatihan::findOrFail($id_paket);
        $paket->soal()->detach($id_soal);

        return back()->with('success', 'Soal berhasil dilepas dari paket ini.');
    }

    public function addSoal(Request $request, string $id_paket)
    {
        $paket = PaketLatihan::findOrFail($id_paket);

        $validSubtes = ['PU', 'PPU', 'PK', 'PBM', 'LBI', 'LBIng', 'PM'];
        $isTryout    = $paket->tipe === 'tryout';

        $request->validate([
            'soal_ids'   => 'required|array|min:1',
            'soal_ids.*' => 'exists:soal,id_soal',
            'subtes'     => ($isTryout ? 'required' : 'nullable') . '|string|in:' . implode(',', $validSubtes),
        ]);

        $subtes = $request->input('subtes'); // null untuk latihan soal

        // Buat array pivot: setiap id_soal disertai subtes (otomatis sinkron dengan kategori asli soal)
        $soals = \App\Models\Soal::whereIn('id_soal', $request->soal_ids)->get()->keyBy('id_soal');
        $pivotData = collect($request->soal_ids)
            ->mapWithKeys(function ($id) use ($soals, $subtes, $isTryout) {
                if (!$isTryout) {
                    return [$id => ['subtes' => null]];
                }
                $soal = $soals->get($id);
                $mapped = $soal ? \App\Http\Controllers\Siswa\TryoutController::mapKategoriToSubtes($soal->kategori) : null;
                return [$id => ['subtes' => $mapped ?: $subtes]];
            })
            ->all();

        $paket->soal()->syncWithoutDetaching($pivotData);

        return back()->with('success', count($request->soal_ids) . ' soal berhasil ditambahkan ke paket.');
    }

    public function destroy(string $id)
    {
        $paket = PaketLatihan::findOrFail($id);

        DB::beginTransaction();
        try {
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

            // Lepaskan relasi soal dari paket ini
            $paket->soal()->detach();

            // Hapus notifikasi yang merujuk ke paket latihan ini
            DB::table('notifikasi')->where('tipe', 'latihan')->where('id_referensi', $paket->id_paket)->delete();

            // Hapus paket latihan
            $paket->delete();

            DB::commit();
            $targetRoute = $paket->tipe === 'tryout' ? 'paket-tryout.index' : 'paket-latihan.index';
            $label = $paket->tipe === 'tryout' ? 'Paket Try Out' : 'Paket Latihan';
            return redirect()->route($targetRoute)->with('success', $label . ' berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus paket latihan: ' . $e->getMessage()]);
        }
    }
}
