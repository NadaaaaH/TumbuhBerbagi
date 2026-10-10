<?php

use App\Models\HasilLatihan;
use App\Models\Admin;
use App\Models\JawabanSiswa;
use App\Models\PaketLatihan;
use App\Models\PilihanJawaban;
use App\Models\SesiLatihan;
use App\Models\Siswa;
use App\Models\Soal;
use App\Services\Admin\SesiLatihanDetailService;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

function createDetailTestStudent(string $name): Siswa
{
    return Siswa::create([
        'nama' => $name,
        'email' => strtolower(str_replace(' ', '.', $name)) . '@example.test',
        'password' => 'password',
        'status_akun' => 'aktif',
    ]);
}

function createDetailTestPackage(): PaketLatihan
{
    return PaketLatihan::create([
        'nama_paket' => 'Paket Analisis',
        'status' => 'aktif',
        'tipe' => 'tryout',
    ]);
}

function createDetailTestSession(PaketLatihan $paket, Siswa $siswa, string $status, string $startedAt, ?string $finishedAt = null): SesiLatihan
{
    return SesiLatihan::create([
        'id_paket' => $paket->id_paket,
        'id_siswa' => $siswa->id_siswa,
        'status' => $status,
        'waktu_mulai' => $startedAt,
        'waktu_selesai' => $finishedAt,
        'is_paused' => false,
    ]);
}

it('aggregates unique participant states, score, question accuracy, blanks, options, and server-side filters', function () {
    Carbon::setTestNow('2026-10-10 13:40:00');
    $paket = createDetailTestPackage();
    $firstStudent = createDetailTestStudent('Amira Hasna');
    $secondStudent = createDetailTestStudent('Budi Santoso');
    $activeStudent = createDetailTestStudent('Citra Dewi');
    createDetailTestStudent('Dimas Putra');

    $completedOne = createDetailTestSession($paket, $firstStudent, 'selesai', '2026-10-10 12:00:00', '2026-10-10 12:35:00');
    $completedTwo = createDetailTestSession($paket, $secondStudent, 'selesai', '2026-10-10 12:10:00', '2026-10-10 12:45:00');
    $olderCompletedAttempt = createDetailTestSession($paket, $activeStudent, 'selesai', '2026-10-10 11:00:00', '2026-10-10 11:30:00');
    createDetailTestSession($paket, $activeStudent, 'aktif', '2026-10-10 13:30:00');

    HasilLatihan::create([
        'id_sesi' => $completedOne->id_sesi,
        'total_soal' => 2,
        'jumlah_benar' => 1,
        'jumlah_salah' => 1,
        'nilai_akhir' => 50,
    ]);
    HasilLatihan::create([
        'id_sesi' => $completedOne->id_sesi,
        'total_soal' => 2,
        'jumlah_benar' => 1,
        'jumlah_salah' => 1,
        'nilai_akhir' => 85,
    ]);
    HasilLatihan::create([
        'id_sesi' => $completedTwo->id_sesi,
        'total_soal' => 2,
        'jumlah_benar' => 1,
        'jumlah_salah' => 1,
        'nilai_akhir' => 75,
    ]);
    HasilLatihan::create([
        'id_sesi' => $olderCompletedAttempt->id_sesi,
        'total_soal' => 2,
        'jumlah_benar' => 1,
        'jumlah_salah' => 1,
        'nilai_akhir' => 70,
    ]);

    $answeredQuestion = Soal::create([
        'konten_soal' => 'Soal pilihan',
        'jenis_soal' => 'pilihan_ganda',
        'kategori' => 'PU',
        'tingkat_kesulitan' => 'medium',
        'tingkat_kesulitan_index' => 0.5,
        'kunci_jawaban' => 'A',
        'status' => 'aktif',
    ]);
    $blankQuestion = Soal::create([
        'konten_soal' => 'Soal kosong',
        'jenis_soal' => 'pilihan_ganda',
        'kategori' => 'PU',
        'kunci_jawaban' => 'B',
        'status' => 'aktif',
    ]);
    $paket->soal()->attach([
        $answeredQuestion->id_soal => ['subtes' => 'PU'],
        $blankQuestion->id_soal => ['subtes' => 'PU'],
    ]);

    $choiceA = PilihanJawaban::create([
        'id_soal' => $answeredQuestion->id_soal,
        'kode_pilihan' => 'A',
        'teks_pilihan' => 'Opsi A',
    ]);
    $choiceB = PilihanJawaban::create([
        'id_soal' => $answeredQuestion->id_soal,
        'kode_pilihan' => 'B',
        'teks_pilihan' => 'Opsi B',
    ]);
    PilihanJawaban::create([
        'id_soal' => $blankQuestion->id_soal,
        'kode_pilihan' => 'B',
        'teks_pilihan' => 'Opsi B',
    ]);

    JawabanSiswa::create([
        'id_sesi' => $completedOne->id_sesi,
        'id_soal' => $answeredQuestion->id_soal,
        'id_pilihan' => $choiceB->id_pilihan,
        'is_benar' => false,
    ]);
    JawabanSiswa::create([
        'id_sesi' => $completedOne->id_sesi,
        'id_soal' => $answeredQuestion->id_soal,
        'id_pilihan' => $choiceA->id_pilihan,
        'is_benar' => true,
    ]);
    JawabanSiswa::create([
        'id_sesi' => $completedTwo->id_sesi,
        'id_soal' => $answeredQuestion->id_soal,
        'id_pilihan' => $choiceB->id_pilihan,
        'is_benar' => false,
    ]);
    JawabanSiswa::create([
        'id_sesi' => $completedOne->id_sesi,
        'id_soal' => $blankQuestion->id_soal,
        'is_benar' => false,
    ]);

    $service = app(SesiLatihanDetailService::class);
    $summary = $service->summary($paket);
    $questions = $service->questionStats($paket)->keyBy('id_soal');
    $participants = $service->participants($paket, [])->getCollection()->keyBy('id_siswa');

    expect($summary)->toMatchArray([
        'total' => 4,
        'selesai' => 2,
        'sedang_mengerjakan' => 1,
        'belum_mulai' => 1,
        'rata_rata_nilai' => 80,
    ])
        ->and($summary['total'])->toBe($summary['selesai'] + $summary['sedang_mengerjakan'] + $summary['belum_mulai'])
        ->and($participants[$firstStudent->id_siswa]['durasi'])->toBe(35)
        ->and($participants[$activeStudent->id_siswa]['durasi'])->toBe(10)
        ->and($participants[$activeStudent->id_siswa]['status'])->toBe('sedang_mengerjakan')
        ->and((float) $completedOne->fresh()->hasil_latihan->nilai_akhir)->toBe(85.0)
        ->and($questions[$answeredQuestion->id_soal]['jumlah_respons'])->toBe(2)
        ->and($questions[$answeredQuestion->id_soal]['jumlah_benar'])->toBe(1)
        ->and($questions[$answeredQuestion->id_soal]['jumlah_salah'])->toBe(1)
        ->and($questions[$answeredQuestion->id_soal]['jumlah_kosong'])->toBe(0)
        ->and($questions[$answeredQuestion->id_soal]['akurasi'])->toBe(50.0)
        ->and($questions[$answeredQuestion->id_soal]['distribusi_pilihan'])->toBe(['A' => 1, 'B' => 1])
        ->and($questions[$blankQuestion->id_soal]['jumlah_respons'])->toBe(0)
        ->and($questions[$blankQuestion->id_soal]['jumlah_kosong'])->toBe(2)
        ->and($questions[$blankQuestion->id_soal]['akurasi'])->toBeNull()
        ->and($service->participants($paket, ['search' => 'amira'])->total())->toBe(1)
        ->and($service->participants($paket, ['status' => 'belum_mulai'])->total())->toBe(1)
        ->and($service->participants($paket, ['sort' => 'nama_desc'])->first()['nama'])->toBe('Dimas Putra');

    Carbon::setTestNow();
});

it('returns empty and null aggregates when there are no participants or valid responses', function () {
    $paket = createDetailTestPackage();
    $question = Soal::create([
        'konten_soal' => 'Belum dijawab',
        'jenis_soal' => 'pilihan_ganda',
        'status' => 'aktif',
    ]);
    $paket->soal()->attach($question->id_soal, ['subtes' => 'PU']);

    $service = app(SesiLatihanDetailService::class);
    $summary = $service->summary($paket);
    $stats = $service->questionStats($paket)->first();

    expect($summary)->toMatchArray([
        'total' => 0,
        'selesai' => 0,
        'sedang_mengerjakan' => 0,
        'belum_mulai' => 0,
        'rata_rata_nilai' => null,
    ])
        ->and($service->participants($paket, [])->total())->toBe(0)
        ->and($stats['jumlah_respons'])->toBe(0)
        ->and($stats['jumlah_kosong'])->toBe(0)
        ->and($stats['akurasi'])->toBeNull()
        ->and($stats['distribusi_pilihan'])->toBeNull();
});

it('passes the expected Inertia props and keeps participant preview and export routes working', function () {
    $admin = Admin::create([
        'nama' => 'Admin Test',
        'email' => 'admin@example.test',
        'password' => 'password',
    ]);
    $paket = createDetailTestPackage();
    $student = createDetailTestStudent('Peserta Test');
    $session = createDetailTestSession($paket, $student, 'selesai', '2026-10-10 10:00:00', '2026-10-10 10:45:00');
    HasilLatihan::create([
        'id_sesi' => $session->id_sesi,
        'total_soal' => 1,
        'jumlah_benar' => 1,
        'jumlah_salah' => 0,
        'nilai_akhir' => 88,
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('sesi-latihan.show', $paket->id_paket))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SesiLatihan/Show')
            ->where('summary.total', 1)
            ->where('summary.rata_rata_nilai', 88)
            ->has('participants.data', 1)
            ->where('participants.data.0.nilai', 88)
            ->has('questionStats', 0)
        );

    $this->get(route('sesi-latihan.preview-siswa', $session->id_sesi))->assertOk();
    $this->get(route('sesi-latihan.export-siswa', $session->id_sesi))->assertOk();
    $this->get(route('sesi-latihan.preview-all', $paket->id_paket))->assertOk();
    $this->get(route('sesi-latihan.export-all', $paket->id_paket))->assertOk();
});

it('paginates the participant query in the database', function () {
    $paket = createDetailTestPackage();
    foreach (range(1, 12) as $number) {
        createDetailTestStudent("Peserta {$number}");
    }

    $service = app(SesiLatihanDetailService::class);
    $firstPage = $service->participants($paket, ['page' => 1]);
    $secondPage = $service->participants($paket, ['page' => 2]);

    expect($firstPage->total())->toBe(12)
        ->and($firstPage->currentPage())->toBe(1)
        ->and($firstPage->count())->toBe(10)
        ->and($secondPage->currentPage())->toBe(2)
        ->and($secondPage->count())->toBe(2);
});
