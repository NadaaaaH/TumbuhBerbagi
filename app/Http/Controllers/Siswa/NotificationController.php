<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(string $id)
    {
        $siswa = auth()->user();
        $notification = Notifikasi::where('id_siswa', $siswa->id_siswa)
            ->where('id_notifikasi', $id)
            ->firstOrFail();

        $notification->update(['is_dibaca' => true]);

        return back()->with('success', 'Notifikasi ditandai sebagai dibaca.');
    }

    public function markAllAsRead()
    {
        $siswa = auth()->user();
        Notifikasi::where('id_siswa', $siswa->id_siswa)
            ->where('is_dibaca', false)
            ->update(['is_dibaca' => true]);

        return back()->with('success', 'Semua notifikasi ditandai sebagai dibaca.');
    }
}
