<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Inertia\Inertia;

class KegiatanPublikController extends Controller
{
    public function show(string $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        return Inertia::render('Kegiatan/Show', [
            'kegiatan' => $kegiatan,
        ]);
    }
}
