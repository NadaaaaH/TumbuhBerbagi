<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    /**
     * Melayani file media dari Cloudflare R2 secara aman melalui aplikasi,
     * menghindari pemblokiran domain publik *.r2.dev oleh ISP Indonesia (Internet Positif).
     */
    public function show(string $path)
    {
        // Cegah directory traversal
        if (str_contains($path, '..')) {
            abort(400, 'Invalid path');
        }

        $disk = Storage::disk('r2');

        if (!$disk->exists($path)) {
            abort(404, 'File not found');
        }

        return $disk->response($path, null, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
