<?php

namespace App\Services\Admin;

use App\Models\PaketLatihan;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SesiLatihanDetailService
{
    private const PAGE_SIZE = 10;

    private const PARTICIPANT_SORTS = [
        'nilai_desc',
        'nilai_asc',
        'nama_asc',
        'nama_desc',
        'terbaru',
    ];

    public function summary(PaketLatihan $paket): array
    {
        $summary = $this->participantsQuery($paket)
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN sesi.status = 'selesai' THEN 1 ELSE 0 END) as selesai")
            ->selectRaw("SUM(CASE WHEN sesi.status = 'aktif' THEN 1 ELSE 0 END) as sedang_mengerjakan")
            ->selectRaw("SUM(CASE WHEN sesi.status IS NULL OR sesi.status NOT IN ('aktif', 'selesai') THEN 1 ELSE 0 END) as belum_mulai")
            ->selectRaw("AVG(CASE WHEN sesi.status = 'selesai' THEN hasil.nilai_akhir END) as rata_rata_nilai")
            ->first();

        return [
            'total' => (int) $summary->total,
            'selesai' => (int) $summary->selesai,
            'sedang_mengerjakan' => (int) $summary->sedang_mengerjakan,
            'belum_mulai' => (int) $summary->belum_mulai,
            'rata_rata_nilai' => $summary->rata_rata_nilai === null
                ? null
                : round((float) $summary->rata_rata_nilai),
        ];
    }

    public function participants(PaketLatihan $paket, array $filters): LengthAwarePaginator
    {
        $query = $this->participantsQuery($paket);
        $search = trim((string) ($filters['search'] ?? ''));
        $status = $filters['status'] ?? '';
        $sort = $filters['sort'] ?? 'nilai_desc';

        if ($search !== '') {
            $searchTerm = '%' . mb_strtolower($search) . '%';
            $query->where(function (Builder $query) use ($searchTerm) {
                $query->whereRaw('LOWER(siswa.nama) LIKE ?', [$searchTerm])
                    ->orWhereRaw('LOWER(siswa.email) LIKE ?', [$searchTerm]);
            });
        }

        if ($status !== '') {
            $this->applyStatusFilter($query, $status);
        }

        $this->applyParticipantSort($query, $sort);

        return $query
            ->select([
                'siswa.id_siswa',
                'siswa.nama',
                'siswa.email',
                'sesi.id_sesi',
                'sesi.is_paused',
                'sesi.status as status_attempt',
                'sesi.waktu_mulai',
                'sesi.waktu_selesai',
                'hasil.id_hasil as id_hasil_result',
            ])
            ->selectRaw($this->participantStatusSql() . ' as status')
            ->selectRaw("CASE WHEN sesi.status = 'selesai' THEN hasil.nilai_akhir END as nilai")
            ->selectRaw("CASE WHEN sesi.status = 'selesai' THEN hasil.jumlah_benar END as benar")
            ->selectRaw("CASE WHEN sesi.status = 'selesai' THEN hasil.jumlah_salah END as salah")
            ->paginate(self::PAGE_SIZE, ['*'], 'page', $filters['page'] ?? null)
            ->withQueryString()
            ->through(fn ($row) => $this->formatParticipant($row));
    }

    public function reportParticipants(PaketLatihan $paket): Collection
    {
        $query = $this->participantsQuery($paket)
            ->where('sesi.status', 'selesai')
            ->select([
                'siswa.id_siswa',
                'siswa.nama',
                'siswa.email',
                'sesi.id_sesi',
                'sesi.status as status_attempt',
                'sesi.waktu_mulai',
                'sesi.waktu_selesai',
                'hasil.nilai_akhir as nilai',
                'hasil.jumlah_benar as benar',
                'hasil.jumlah_salah as salah',
            ])
            ->orderByRaw('CASE WHEN hasil.nilai_akhir IS NULL THEN 1 ELSE 0 END')
            ->orderByDesc('hasil.nilai_akhir')
            ->orderBy('siswa.nama');

        return $query->get()->map(fn ($row) => $this->formatParticipant($row));
    }

    public function questionStats(PaketLatihan $paket): Collection
    {
        $questions = $paket->soal()
            ->where('soal.status', 'aktif')
            ->with('pilihan_jawaban')
            ->orderBy('soal.id_soal')
            ->get();

        if ($questions->isEmpty()) {
            return collect();
        }

        $eligibleSessions = $this->eligibleSessionsQuery($paket);
        $latestAnswers = $this->latestAnswersQuery($eligibleSessions, $questions->pluck('id_soal'));

        $answerStats = DB::table('jawaban_siswa as jawaban')
            ->joinSub($latestAnswers, 'jawaban_terbaru', 'jawaban_terbaru.id_jawaban', '=', 'jawaban.id_jawaban')
            ->selectRaw('jawaban.id_soal')
            ->selectRaw("SUM(CASE WHEN jawaban.id_pilihan IS NOT NULL OR (jawaban.teks_jawaban IS NOT NULL AND TRIM(jawaban.teks_jawaban) <> '') THEN 1 ELSE 0 END) as jumlah_respons")
            ->selectRaw("SUM(CASE WHEN (jawaban.id_pilihan IS NOT NULL OR (jawaban.teks_jawaban IS NOT NULL AND TRIM(jawaban.teks_jawaban) <> '')) AND jawaban.is_benar = true THEN 1 ELSE 0 END) as jumlah_benar")
            ->selectRaw("SUM(CASE WHEN (jawaban.id_pilihan IS NOT NULL OR (jawaban.teks_jawaban IS NOT NULL AND TRIM(jawaban.teks_jawaban) <> '')) AND jawaban.is_benar = false THEN 1 ELSE 0 END) as jumlah_salah")
            ->groupBy('jawaban.id_soal')
            ->get()
            ->keyBy('id_soal');

        $optionCounts = DB::table('jawaban_siswa as jawaban')
            ->joinSub($latestAnswers, 'jawaban_terbaru', 'jawaban_terbaru.id_jawaban', '=', 'jawaban.id_jawaban')
            ->join('pilihan_jawaban as pilihan', 'pilihan.id_pilihan', '=', 'jawaban.id_pilihan')
            ->whereNotNull('jawaban.id_pilihan')
            ->select('jawaban.id_soal', 'pilihan.kode_pilihan')
            ->selectRaw('COUNT(*) as jumlah')
            ->groupBy('jawaban.id_soal', 'pilihan.kode_pilihan')
            ->get()
            ->groupBy('id_soal');

        $opportunityCount = $eligibleSessions->count();

        return $questions->map(function ($question) use ($answerStats, $optionCounts, $opportunityCount) {
            $stats = $answerStats->get($question->id_soal);
            $correct = (int) ($stats->jumlah_benar ?? 0);
            $incorrect = (int) ($stats->jumlah_salah ?? 0);
            $validResponses = (int) ($stats->jumlah_respons ?? 0);
            $options = $optionCounts->get($question->id_soal, collect())->keyBy('kode_pilihan');

            $choices = $question->pilihan_jawaban->map(function ($choice) use ($options, $question) {
                return [
                    'id_pilihan' => $choice->id_pilihan,
                    'kode_pilihan' => $choice->kode_pilihan,
                    'teks_pilihan' => $choice->teks_pilihan,
                    'jumlah' => (int) ($options->get($choice->kode_pilihan)->jumlah ?? 0),
                    'is_kunci' => strtoupper(trim((string) $choice->kode_pilihan))
                        === strtoupper(trim((string) $question->kunci_jawaban)),
                ];
            })->values();

            return [
                'id_soal' => $question->id_soal,
                'konten_soal' => $question->konten_soal,
                'kategori' => $question->kategori ?: $question->pivot?->subtes,
                'jumlah_respons' => $validResponses,
                'jumlah_benar' => $correct,
                'jumlah_salah' => $incorrect,
                'jumlah_kosong' => max(0, $opportunityCount - $validResponses),
                'akurasi' => $validResponses > 0
                    ? round(($correct / $validResponses) * 100, 2)
                    : null,
                'tingkat_kesulitan' => $question->tingkat_kesulitan,
                'tingkat_kesulitan_index' => $question->tingkat_kesulitan_index,
                'bobot_nilai' => $question->bobot_nilai,
                'kunci_jawaban' => $question->kunci_jawaban,
                'pilihan' => $choices,
                'distribusi_pilihan' => $choices->isEmpty()
                    ? null
                    : $choices->mapWithKeys(fn ($choice) => [
                        $choice['kode_pilihan'] => $choice['jumlah'],
                    ])->all(),
            ];
        });
    }

    private function participantsQuery(PaketLatihan $paket): Builder
    {
        $latestSessions = DB::table('sesi_latihan')
            ->selectRaw('id_siswa, MAX(id_sesi) as id_sesi')
            ->where('id_paket', $paket->id_paket)
            ->whereNotNull('id_siswa')
            ->groupBy('id_siswa');

        $latestResults = DB::table('hasil_latihan')
            ->selectRaw('id_sesi, MAX(id_hasil) as id_hasil')
            ->groupBy('id_sesi');

        return DB::table('siswa')
            ->leftJoinSub($latestSessions, 'sesi_terbaru', 'sesi_terbaru.id_siswa', '=', 'siswa.id_siswa')
            ->leftJoin('sesi_latihan as sesi', 'sesi.id_sesi', '=', 'sesi_terbaru.id_sesi')
            ->leftJoinSub($latestResults, 'hasil_terbaru', 'hasil_terbaru.id_sesi', '=', 'sesi.id_sesi')
            ->leftJoin('hasil_latihan as hasil', 'hasil.id_hasil', '=', 'hasil_terbaru.id_hasil');
    }

    private function eligibleSessionsQuery(PaketLatihan $paket): Builder
    {
        return DB::table('sesi_latihan as sesi')
            ->joinSub($this->latestSessionsQuery($paket), 'sesi_terbaru', 'sesi_terbaru.id_sesi', '=', 'sesi.id_sesi')
            ->joinSub(
                DB::table('hasil_latihan')
                    ->selectRaw('id_sesi, MAX(id_hasil) as id_hasil')
                    ->groupBy('id_sesi'),
                'hasil_terbaru',
                'hasil_terbaru.id_sesi',
                '=',
                'sesi.id_sesi'
            )
            ->where('sesi.status', 'selesai')
            ->whereNotNull('hasil.nilai_akhir')
            ->join('hasil_latihan as hasil', 'hasil.id_hasil', '=', 'hasil_terbaru.id_hasil')
            ->select('sesi.id_sesi');
    }

    private function latestSessionsQuery(PaketLatihan $paket): Builder
    {
        return DB::table('sesi_latihan')
            ->selectRaw('id_siswa, MAX(id_sesi) as id_sesi')
            ->where('id_paket', $paket->id_paket)
            ->whereNotNull('id_siswa')
            ->groupBy('id_siswa');
    }

    private function latestAnswersQuery(Builder $eligibleSessions, Collection $questionIds): Builder
    {
        return DB::table('jawaban_siswa as jawaban')
            ->joinSub($eligibleSessions, 'sesi_selesai', 'sesi_selesai.id_sesi', '=', 'jawaban.id_sesi')
            ->whereIn('jawaban.id_soal', $questionIds)
            ->selectRaw('MAX(jawaban.id_jawaban) as id_jawaban')
            ->groupBy('jawaban.id_sesi', 'jawaban.id_soal');
    }

    private function applyStatusFilter(Builder $query, string $status): void
    {
        if ($status === 'selesai') {
            $query->where('sesi.status', 'selesai');
        } elseif ($status === 'sedang_mengerjakan') {
            $query->where('sesi.status', 'aktif');
        } else {
            $query->where(function (Builder $query) {
                $query->whereNull('sesi.status')
                    ->orWhereNotIn('sesi.status', ['aktif', 'selesai']);
            });
        }
    }

    private function applyParticipantSort(Builder $query, string $sort): void
    {
        if (!in_array($sort, self::PARTICIPANT_SORTS, true)) {
            $sort = 'nilai_desc';
        }

        if ($sort === 'nama_asc' || $sort === 'nama_desc') {
            $query->orderBy('siswa.nama', $sort === 'nama_asc' ? 'asc' : 'desc');
        } elseif ($sort === 'terbaru') {
            $query->orderByRaw('CASE WHEN sesi.waktu_selesai IS NULL THEN 1 ELSE 0 END')
                ->orderByDesc('sesi.waktu_selesai');
        } else {
            $query->orderByRaw('CASE WHEN hasil.nilai_akhir IS NULL THEN 1 ELSE 0 END')
                ->orderBy('hasil.nilai_akhir', $sort === 'nilai_asc' ? 'asc' : 'desc');
        }

        $query->orderBy('siswa.id_siswa');
    }

    private function participantStatusSql(): string
    {
        return "CASE WHEN sesi.status = 'selesai' THEN 'selesai' WHEN sesi.status = 'aktif' THEN 'sedang_mengerjakan' ELSE 'belum_mulai' END";
    }

    private function formatParticipant(object $participant): array
    {
        $duration = null;
        if ($participant->waktu_mulai) {
            $start = Carbon::parse($participant->waktu_mulai);
            $isPaused = (bool) ($participant->is_paused ?? false);
            $end = $participant->waktu_selesai
                ? Carbon::parse($participant->waktu_selesai)
                : ($participant->status_attempt === 'aktif' && !$isPaused ? now() : null);

            if ($end) {
                $duration = $end->lessThan($start)
                    ? 0
                    : (int) round($start->diffInSeconds($end) / 60);
            }
        }

        return [
            'id' => $participant->id_sesi ?: 'belum-' . $participant->id_siswa,
            'id_siswa' => $participant->id_siswa,
            'id_sesi' => $participant->id_sesi,
            'nama' => $participant->nama,
            'email' => $participant->email,
            'status' => $participant->status ?? $this->statusFor($participant->status_attempt),
            'nilai' => $participant->nilai === null ? null : (float) $participant->nilai,
            'benar' => $participant->benar === null ? null : (int) $participant->benar,
            'salah' => $participant->salah === null ? null : (int) $participant->salah,
            'durasi' => $duration,
            'waktu_mulai' => $participant->waktu_mulai,
            'waktu_selesai' => $participant->waktu_selesai,
            'aktivitas_terakhir' => $participant->waktu_selesai ?: $participant->waktu_mulai,
            'canPreview' => $participant->status_attempt === 'selesai'
                && ($participant->id_hasil_result ?? null) !== null,
        ];
    }

    private function statusFor(?string $attemptStatus): string
    {
        if ($attemptStatus === 'selesai') {
            return 'selesai';
        }

        return $attemptStatus === 'aktif' ? 'sedang_mengerjakan' : 'belum_mulai';
    }
}
