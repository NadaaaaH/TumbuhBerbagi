# Source Code Implementasi Kelas (Model Laravel)

Berikut adalah *source code* lengkap dari kelas-kelas model pada proyek **TumbuhBerbagi** yang bersesuaian dengan **UML Class Diagram** untuk diletakkan di bab implementasi laporan Anda. Kode telah dirapikan dan disesuaikan agar selaras dengan diagram kelas.

---

## 1. Kelas `Admin`
Model ini merepresentasikan entitas Administrator sistem yang mengelola aktivitas, jadwal, paket latihan, dan memantau sesi latihan siswa.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use Notifiable;

    protected $table = 'admin';
    protected $primaryKey = 'id_admin';
    public $timestamps = false;

    protected $fillable = [
        'nama',
        'email',
        'password',
        'no_handphone',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Konversi tipe data atribut (casting).
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
```

---

## 2. Kelas `Siswa`
Model ini merepresentasikan entitas Siswa yang dapat mengikuti kegiatan, menerima notifikasi, mengatur jadwal alarm, dan melakukan pengerjaan latihan soal.

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;

class Siswa extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, MustVerifyEmailTrait;

    protected $table = 'siswa';
    protected $primaryKey = 'id_siswa';
    public $timestamps = false;

    protected $fillable = [
        'nama',
        'email',
        'password',
        'no_handphone',
        'status_akun',
        'email_verified_at',
        'force_password_change',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Konversi tipe data atribut (casting).
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'email_verified_at' => 'datetime',
            'force_password_change' => 'boolean',
        ];
    }
}
```

---

## 3. Kelas `Kegiatan`
Model ini menyimpan data kegiatan/event sosial tumbuh berbagi yang diatur oleh Admin.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'kegiatan';
    protected $primaryKey = 'id_kegiatan';
    public $timestamps = false;

    protected $fillable = [
        'nama_kegiatan',
        'deskripsi',
        'gambar',
        'tanggal',
        'waktu_mulai',
        'waktu_selesai',
        'status',
    ];

    protected $appends = ['gambar_url'];

    /**
     * Boot method untuk mengatur default value secara otomatis saat saving.
     */
    protected static function booted()
    {
        static::saving(function ($kegiatan) {
            if (empty($kegiatan->status)) {
                $kegiatan->status = 'aktif';
            }
        });
    }

    /**
     * Getter dinamis status kegiatan berdasarkan waktu saat ini.
     */
    public function getStatusAttribute($value)
    {
        if ($value === 'nonaktif') {
            return 'nonaktif';
        }

        if ($this->tanggal && $this->waktu_selesai) {
            $endDateTime = \Carbon\Carbon::parse($this->tanggal . ' ' . $this->waktu_selesai);
            if (now()->greaterThan($endDateTime)) {
                return 'nonaktif';
            }
        }

        return 'aktif';
    }

    /**
     * Aksesor untuk mendapatkan full URL gambar.
     */
    public function getGambarUrlAttribute()
    {
        if ($this->gambar) {
            if (filter_var($this->gambar, FILTER_VALIDATE_URL)) {
                return $this->gambar;
            }
            return Storage::disk(config('filesystems.default'))->url($this->gambar);
        }
        
        return null;
    }
}
```

---

## 4. Kelas `AktivitasSiswa`
Model ini mencatat log setiap tindakan/aktivitas belajar atau pengerjaan soal yang dilakukan siswa di aplikasi untuk keperluan audit trail.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AktivitasSiswa extends Model
{
    protected $table = 'aktivitas_siswa';
    protected $primaryKey = 'id_aktivitas';

    protected $fillable = [
        'id_siswa',
        'tipe_aktivitas',
        'deskripsi',
    ];

    /**
     * Relasi Many-to-One ke kelas Siswa.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }

    /**
     * Method static untuk mencatat log aktivitas siswa yang sedang login.
     */
    public static function log($tipe, $deskripsi)
    {
        $id_siswa = auth('siswa')->id();
        
        self::create([
            'id_siswa' => $id_siswa,
            'tipe_aktivitas' => $tipe,
            'deskripsi' => $deskripsi,
        ]);
    }
}
```

---

## 5. Kelas `Jadwal`
Model ini digunakan untuk mengelola agenda kegiatan bimbingan belajar, konsultasi, maupun pengerjaan tugas bersama.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Jadwal extends Model
{
    use HasFactory;

    protected $table = 'jadwal';
    protected $primaryKey = 'id_jadwal';
    public $timestamps = false;

    protected $fillable = [
        'nama_jadwal',
        'tanggal',
        'waktu_mulai',
        'waktu_selesai',
        'status',
    ];

    /**
     * Booted method untuk mengatur waktu selesai default (1 jam dari waktu mulai) 
     * dan status awal saat data disimpan.
     */
    protected static function booted()
    {
        static::saving(function ($jadwal) {
            if (empty($jadwal->waktu_selesai) && !empty($jadwal->waktu_mulai)) {
                $jadwal->waktu_selesai = Carbon::parse($jadwal->waktu_mulai)->addHour()->format('H:i:s');
            }
            
            if (empty($jadwal->status)) {
                $jadwal->status = 'aktif';
            }
        });
    }

    /**
     * Aksesor status jadwal yang dinamis membandingkan waktu sekarang dengan jadwal.
     */
    public function getStatusAttribute($value)
    {
        if ($value === 'nonaktif') {
            return 'nonaktif';
        }

        if ($this->tanggal && $this->waktu_selesai) {
            $endDateTime = Carbon::parse($this->tanggal . ' ' . $this->waktu_selesai);
            if (now()->greaterThan($endDateTime)) {
                return 'nonaktif';
            }
        } elseif ($this->tanggal && $this->waktu_mulai) {
            $endDateTime = Carbon::parse($this->tanggal . ' ' . $this->waktu_mulai)->addHour();
            if (now()->greaterThan($endDateTime)) {
                return 'nonaktif';
            }
        }

        return 'aktif';
    }
}
```

---

## 6. Kelas `JadwalAlarm`
Model pivot yang mengaitkan Siswa dengan Jadwal untuk pengingat/alarm aktivitas bimbingan.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalAlarm extends Model
{
    protected $table = 'jadwal_alarms';
    protected $primaryKey = 'id_alarm';

    protected $fillable = [
        'id_siswa',
        'id_jadwal',
    ];

    /**
     * Relasi ke model Siswa.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }

    /**
     * Relasi ke model Jadwal.
     */
    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'id_jadwal', 'id_jadwal');
    }
}
```

---

## 7. Kelas `Notifikasi`
Model ini bertugas mengirimkan pesan pengumuman atau pengingat ke akun masing-masing siswa.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table = 'notifikasi';
    protected $primaryKey = 'id_notifikasi';

    protected $fillable = [
        'id_siswa',
        'judul',
        'pesan',
        'tipe',
        'id_referensi',
        'is_dibaca',
    ];

    /**
     * Relasi Many-to-One ke model Siswa pemilik notifikasi.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }
}
```

---

## 8. Kelas `PaketLatihan` (UML: `Paket pilihan`)
Model ini mengelompokkan kumpulan soal menjadi satu paket ujian/latihan mandiri yang dibatasi oleh durasi waktu.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketLatihan extends Model
{
    use HasFactory;

    protected $table = 'paket_latihan';
    protected $primaryKey = 'id_paket';
    public $timestamps = false;

    protected $fillable = [
        'nama_paket',
        'deskripsi',
        'status',
        'waktu_ujian',
    ];

    /**
     * Relasi One-to-Many ke Soal-soal di dalam paket latihan.
     */
    public function soal()
    {
        return $this->hasMany(Soal::class, 'id_paket', 'id_paket');
    }

    /**
     * Relasi One-to-Many ke SesiLatihan pengerjaan siswa.
     */
    public function sesi_latihan()
    {
        return $this->hasMany(SesiLatihan::class, 'id_paket', 'id_paket');
    }
}
```

---

## 9. Kelas `Soal`
Model ini menyimpan data butir pertanyaan latihan, lengkap dengan kunci jawaban, pembahasan, tipe soal, dan tingkat kesulitan.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    use HasFactory;

    protected $table = 'soal';
    protected $primaryKey = 'id_soal';
    public $timestamps = false;

    protected $fillable = [
        'id_paket',
        'konten_soal',
        'jenis_soal',
        'kategori',
        'tingkat_kesulitan',
        'kunci_jawaban',
        'pembahasan',
        'bobot_nilai',
        'is_case_sensitive',
        'status',
    ];

    /**
     * Relasi Many-to-One kembali ke PaketLatihan induknya.
     */
    public function paket_latihan()
    {
        return $this->belongsTo(PaketLatihan::class, 'id_paket', 'id_paket');
    }

    /**
     * Relasi One-to-Many ke pilihan jawaban penunjang (pilihan ganda).
     */
    public function pilihan_jawaban()
    {
        return $this->hasMany(PilihanJawaban::class, 'id_soal', 'id_soal');
    }

    /**
     * Relasi One-to-Many ke jawaban yang dikirimkan oleh siswa.
     */
    public function jawaban_siswa()
    {
        return $this->hasMany(JawabanSiswa::class, 'id_soal', 'id_soal');
    }
}
```

---

## 10. Kelas `PilihanJawaban`
Model pendukung kelas Soal yang menyimpan opsi pilihan ganda A, B, C, D, atau E.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilihanJawaban extends Model
{
    use HasFactory;

    protected $table = 'pilihan_jawaban';
    protected $primaryKey = 'id_pilihan';
    public $timestamps = false;

    protected $fillable = [
        'id_soal',
        'kode_pilihan',
        'teks_pilihan',
    ];

    /**
     * Relasi Many-to-One ke model Soal.
     */
    public function soal()
    {
        return $this->belongsTo(Soal::class, 'id_soal', 'id_soal');
    }
}
```

---

## 11. Kelas `JawabanSiswa`
Model ini menyimpan setiap jawaban aktual yang dipilih/diinput oleh siswa untuk masing-masing soal pada suatu sesi pengerjaan.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanSiswa extends Model
{
    use HasFactory;

    protected $table = 'jawaban_siswa';
    protected $primaryKey = 'id_jawaban';
    public $timestamps = false;

    protected $fillable = [
        'id_sesi',
        'id_soal',
        'id_pilihan',
        'teks_jawaban',
        'is_benar',
    ];

    /**
     * Relasi Many-to-One ke SesiLatihan pengerjaan terkait.
     */
    public function sesi_latihan()
    {
        return $this->belongsTo(SesiLatihan::class, 'id_sesi', 'id_sesi');
    }

    /**
     * Relasi Many-to-One ke Soal yang dijawab.
     */
    public function soal()
    {
        return $this->belongsTo(Soal::class, 'id_soal', 'id_soal');
    }

    /**
     * Relasi Many-to-One ke PilihanJawaban jika berupa pilihan ganda.
     */
    public function pilihan_jawaban()
    {
        return $this->belongsTo(PilihanJawaban::class, 'id_pilihan', 'id_pilihan');
    }
}
```

---

## 12. Kelas `SesiLatihan`
Model ini mencatat riwayat pengerjaan paket soal tertentu oleh siswa, merekam waktu mulai, waktu selesai, dan status pengerjaan.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesiLatihan extends Model
{
    use HasFactory;

    protected $table = 'sesi_latihan';
    protected $primaryKey = 'id_sesi';
    public $timestamps = false;

    protected $fillable = [
        'id_siswa',
        'id_paket',
        'waktu_mulai',
        'waktu_selesai',
        'status',
    ];

    /**
     * Relasi ke model Siswa yang sedang mengerjakan.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id_siswa');
    }

    /**
     * Relasi ke model PaketLatihan yang sedang dikerjakan.
     */
    public function paket_latihan()
    {
        return $this->belongsTo(PaketLatihan::class, 'id_paket', 'id_paket');
    }

    /**
     * Relasi ke daftar JawabanSiswa dalam sesi ini.
     */
    public function jawaban_siswa()
    {
        return $this->hasMany(JawabanSiswa::class, 'id_sesi', 'id_sesi');
    }

    /**
     * Relasi One-to-One ke HasilLatihan (nilai akhir).
     */
    public function hasil_latihan()
    {
        return $this->hasOne(HasilLatihan::class, 'id_sesi', 'id_sesi');
    }
}
```

---

## 13. Kelas `HasilLatihan`
Model ini menyimpan ringkasan hasil kalkulasi nilai pengerjaan siswa setelah sesi latihan selesai.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilLatihan extends Model
{
    use HasFactory;

    protected $table = 'hasil_latihan';
    protected $primaryKey = 'id_hasil';
    public $timestamps = false;

    protected $fillable = [
        'id_sesi',
        'total_soal',
        'jumlah_benar',
        'jumlah_salah',
        'nilai_akhir',
    ];

    /**
     * Relasi kembali ke SesiLatihan yang menghasilkan nilai ini.
     */
    public function sesi_latihan()
    {
        return $this->belongsTo(SesiLatihan::class, 'id_sesi', 'id_sesi');
    }
}
```

---

## 14. Kelas `Laporan`
Model/Kelas representasi untuk dokumen laporan hasil latihan secara keseluruhan atau per-siswa yang dapat dicetak menjadi file eksternal (PDF & Excel) oleh Administrator.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Barryvdh\DomPDF\Facade\Pdf;

class Laporan extends Model
{
    protected $table = 'laporan';
    protected $primaryKey = 'id_laporan';
    public $timestamps = false;

    protected $fillable = [
        'id_sesi',
        'periode',
        'total_siswa',
        'nilai_terendah',
        'nilai_tertinggi',
        'nilai_rata_rata',
        'tanggal_cetak',
    ];

    /**
     * Menghasilkan file PDF laporan hasil latihan.
     * 
     * @return \Illuminate\Http\Response
     */
    public function generatePDF()
    {
        // Logika memuat data laporan dari relasi sesi latihan
        $data = [
            'total_siswa'     => $this->total_siswa,
            'nilai_terendah'  => $this->nilai_terendah,
            'nilai_tertinggi' => $this->nilai_tertinggi,
            'nilai_rata_rata' => $this->nilai_rata_rata,
            'tanggal_cetak'   => $this->tanggal_cetak,
        ];

        $pdf = Pdf::loadView('pdf.laporan_template', $data);
        return $pdf->download("Laporan_Hasil_{$this->id_laporan}.pdf");
    }

    /**
     * Menghasilkan file spreadsheet Excel laporan hasil latihan.
     * 
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function generateExcel()
    {
        // Logika integrasi ke library export Excel (seperti Maatwebsite\Excel)
        // return Excel::download(new LaporanExport($this), 'Laporan.xlsx');
    }
}
```
