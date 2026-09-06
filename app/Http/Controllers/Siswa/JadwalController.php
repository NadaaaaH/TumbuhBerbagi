<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\JadwalAlarm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class JadwalController extends Controller
{
    private function getGoogleCalendarUrl($jadwal)
    {
        try {
            $title = urlencode($jadwal->nama_jadwal ?: 'Jadwal Mentoring Tumbuh Berbagi');
            $startLocal = \Carbon\Carbon::parse($jadwal->tanggal . ' ' . $jadwal->waktu_mulai, 'Asia/Jakarta');
            $endLocal = \Carbon\Carbon::parse($jadwal->tanggal . ' ' . $jadwal->waktu_selesai, 'Asia/Jakarta');
            
            $startUtc = $startLocal->copy()->setTimezone('UTC')->format('Ymd\THms\Z');
            $endUtc = $endLocal->copy()->setTimezone('UTC')->format('Ymd\THms\Z');
            
            $details = urlencode("Sesi mentoring Tumbuh Berbagi.\nLokasi: " . ($jadwal->lokasi ?: 'Online / Zoom'));
            $location = urlencode($jadwal->lokasi ?: 'Online / Zoom');
            
            return "https://calendar.google.com/calendar/render?action=TEMPLATE&text={$title}&dates={$startUtc}/{$endUtc}&details={$details}&location={$location}";
        } catch (\Exception $e) {
            return '#';
        }
    }

    public function index()
    {
        $siswa = Auth::guard('siswa')->user();
        
        // Siswa hanya melihat jadwal dengan status 'aktif'
        $jadwals = Jadwal::where('status', 'aktif')
            ->orderBy('tanggal', 'asc')
            ->orderBy('waktu_mulai', 'asc')
            ->get()
            ->map(function ($jadwal) {
                $jadwal->google_calendar_url = $this->getGoogleCalendarUrl($jadwal);
                return $jadwal;
            });

        // Ambil alarm yang diaktifkan oleh siswa ini
        $alarms = JadwalAlarm::where('id_siswa', $siswa->id_siswa)
            ->pluck('id_jadwal')
            ->toArray();
            
        // Map ke objek dengan key id_jadwal agar mudah dicek di frontend
        $alarmsMap = [];
        foreach ($alarms as $id) {
            $alarmsMap[$id] = true;
        }

        return Inertia::render('Siswa/Jadwal/Index', [
            'jadwals' => $jadwals,
            'activeAlarms' => (object)$alarmsMap
        ]);
    }

    public function toggleAlarm(Request $request, $id)
    {
        $siswa = Auth::guard('siswa')->user();
        $jadwal = Jadwal::findOrFail($id);

        $alarm = JadwalAlarm::where('id_siswa', $siswa->id_siswa)
            ->where('id_jadwal', $jadwal->id_jadwal)
            ->first();

        if ($alarm) {
            // Jika sudah ada, hapus (mematikan alarm)
            $alarm->delete();
            return response()->json([
                'success' => true,
                'active' => false,
                'message' => 'Pengingat email berhasil dinonaktifkan.'
            ]);
        } else {
            // Jika belum ada, buat baru (mengaktifkan alarm)
            JadwalAlarm::create([
                'id_siswa' => $siswa->id_siswa,
                'id_jadwal' => $jadwal->id_jadwal
            ]);

            // Kirim email konfirmasi ke siswa
            try {
                $tanggalFormat = \Carbon\Carbon::parse($jadwal->tanggal)->isoFormat('D MMMM Y');
                $waktuMulai = substr($jadwal->waktu_mulai, 0, 5);
                $waktuSelesai = substr($jadwal->waktu_selesai, 0, 5);
                $googleCalendarUrl = $this->getGoogleCalendarUrl($jadwal);

                Mail::send([], [], function ($message) use ($siswa, $jadwal, $tanggalFormat, $waktuMulai, $waktuSelesai, $googleCalendarUrl) {
                    $message->to($siswa->email)
                        ->subject('⏰ Pengingat Mentoring Aktif: ' . ($jadwal->nama_jadwal ?: 'Jadwal Mentoring'))
                        ->html('
                            <div style="font-family: \'Poppins\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                <div style="text-align: center; border-bottom: 2px solid #1b5e20; padding-bottom: 20px; margin-bottom: 20px;">
                                    <h1 style="color: #1b5e20; margin: 0; font-size: 26px; font-weight: bold;">Tumbuh Berbagi</h1>
                                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Menumbuhkan Kepedulian, Berbagi Kebaikan</p>
                                </div>
                                <div style="padding: 10px 0;">
                                    <p style="font-size: 16px; color: #1e293b; line-height: 1.6; font-weight: bold;">Halo, ' . htmlspecialchars($siswa->nama) . '! 👋</p>
                                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        Kamu baru saja mengaktifkan pengingat email untuk sesi mentoring berikut:
                                    </p>
                                    <div style="background-color: #f0fdf4; border-left: 4px solid #1b5e20; padding: 20px; margin: 20px 0; border-radius: 12px; border: 1px solid #dcfce7; border-left-width: 4px;">
                                        <h3 style="margin-top: 0; margin-bottom: 12px; color: #1b5e20; font-size: 18px; font-weight: bold;">' . htmlspecialchars($jadwal->nama_jadwal ?: 'Jadwal Mentoring') . '</h3>
                                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                                            <tr>
                                                <td style="padding: 6px 0; font-weight: bold; width: 100px; color: #64748b;">Hari & Tgl</td>
                                                <td style="padding: 6px 0; font-weight: 500;">' . $tanggalFormat . '</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Waktu</td>
                                                <td style="padding: 6px 0; font-weight: 500;">' . $waktuMulai . ' - ' . $waktuSelesai . ' WIB</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Lokasi / Link</td>
                                                <td style="padding: 6px 0; font-weight: 500; color: #2563eb;">' . htmlspecialchars($jadwal->lokasi ?: 'Online / Zoom') . '</td>
                                            </tr>
                                        </table>
                                    </div>
                                    <div style="text-align: center; margin: 30px 0 20px 0;">
                                        <a href="' . $googleCalendarUrl . '" target="_blank" style="background-color: #1a73e8; color: #ffffff; padding: 14px 28px; border-radius: 14px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(26,115,232,0.2); transition: all 0.2s;">
                                            📅 Tambahkan ke Google Calendar
                                        </a>
                                    </div>
                                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        Kami akan mengirimkan email pengingat kembali sebelum sesi mentoring dimulai. Jangan sampai terlewat dan persiapkan dirimu sebaik mungkin ya! 🚀
                                    </p>
                                </div>
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 11px;">
                                    <p style="margin: 0;">Email ini dikirim secara otomatis oleh Portal Akademik Tumbuh Berbagi.</p>
                                    <p style="margin: 4px 0 0 0;">© ' . date('Y') . ' Tumbuh Berbagi. Hak Cipta Dilindungi.</p>
                                </div>
                            </div>
                        ');
                });
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send alarm email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'active' => true,
                'message' => 'Pengingat email berhasil diaktifkan. Silakan cek inbox/spam email kamu ya!'
            ]);
        }
    }
}
