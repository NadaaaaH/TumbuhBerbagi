import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save, Clock, Calendar, Shuffle, PauseCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Konstanta Durasi Standar UTBK ────────────────────────────────────────────
const UTBK_SUBTESTS = [
    { kode: 'PU',   nama: 'Penalaran Umum',              menit: 30 },
    { kode: 'PPU',  nama: 'Pengetahuan & Pemahaman Umum', menit: 35 },
    { kode: 'PK',   nama: 'Pengetahuan Kuantitatif',      menit: 40 },
    { kode: 'PBM',  nama: 'Pemahaman Bacaan & Menulis',   menit: 35 },
    { kode: 'LBI',  nama: 'Literasi Bahasa Indonesia',    menit: 45 },
    { kode: 'LBIng',nama: 'Literasi Bahasa Inggris',      menit: 35 },
    { kode: 'PM',   nama: 'Penalaran Matematika',         menit: 45 },
];
const TOTAL_MENIT = UTBK_SUBTESTS.reduce((s, t) => s + t.menit, 0);

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, id }) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-[60px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${
                checked ? 'bg-[#1b5e20] border-[#1b5e20]' : 'bg-slate-200 border-slate-200'
            }`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                checked ? 'translate-x-[31px]' : 'translate-x-0.5'
            }`} />
        </button>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, accent = 'slate' }) {
    const colors = {
        slate: 'border-slate-200 bg-slate-50/50',
        amber: 'border-amber-200 bg-amber-50/40',
        green: 'border-emerald-200 bg-emerald-50/40',
        blue:  'border-blue-200 bg-blue-50/40',
    };
    return (
        <div className={`rounded-2xl border p-5 ${colors[accent]}`}>
            <div className="flex items-center gap-2.5 mb-4">
                <div className={`p-1.5 rounded-lg ${accent === 'amber' ? 'bg-amber-100 text-amber-700' : accent === 'green' ? 'bg-emerald-100 text-emerald-700' : accent === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    <Icon size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Create({ auth }) {
    const [statusMode, setStatusMode]               = useState('nonaktif'); // tryout default nonaktif
    const [showDurasi, setShowDurasi]               = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nama_paket:           '',
        deskripsi:            '',
        tipe:                 'latihan',
        status:               'aktif',
        waktu_ujian:          0,
        tanggal_aktif:        '',
        // Tryout fields
        tanggal_mulai:        '',
        tanggal_selesai:      '',
        is_random:            false,
        bisa_pause:           true,
        tampil_hasil:         'setelah_selesai',
        tanggal_tampil_hasil: '',
    });

    const isTryout = data.tipe === 'tryout';

    // Saat tipe berubah, reset state yang relevan
    const handleTipeChange = (e) => {
        const val = e.target.value;
        setData(d => ({ ...d, tipe: val }));
        if (val === 'tryout') {
            // Tryout tidak langsung aktif
            setStatusMode('nonaktif');
            setData(d => ({ ...d, tipe: val, status: 'nonaktif', tanggal_aktif: '' }));
        } else {
            setStatusMode('aktif');
            setData(d => ({ ...d, tipe: val, status: 'aktif', tanggal_aktif: '' }));
        }
    };

    const handleStatusMode = (mode) => {
        setStatusMode(mode);
        if (mode === 'nonaktif') {
            setData(d => ({ ...d, status: 'nonaktif', tanggal_aktif: '' }));
        } else if (mode === 'terjadwal') {
            setData(d => ({ ...d, status: 'nonaktif' }));
        } else {
            // aktif (hanya untuk latihan)
            setData(d => ({ ...d, status: 'aktif', tanggal_aktif: '' }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('paket-latihan.store'));
    };

    const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

    // ─── Status Modes ─────────────────────────────────────────────────────────
    const latMode = [
        { value: 'aktif',     label: 'Aktif Sekarang' },
        { value: 'nonaktif',  label: 'Nonaktif'        },
        { value: 'terjadwal', label: '⏰ Jadwalkan'    },
    ];
    const toMode = [
        { value: 'nonaktif',  label: 'Aktifkan Nanti (Manual)' },
        { value: 'terjadwal', label: '⏰ Jadwalkan Otomatis'   },
    ];
    const statusModes = isTryout ? toMode : latMode;

    return (
        <AdminLayout user={auth.user} header={isTryout ? 'Buat Try Out Baru' : 'Tambah Paket Latihan'}>
            <Head title={isTryout ? 'Buat Try Out' : 'Tambah Paket'} />

            <div className="mb-6">
                <Link
                    href={route('paket-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Paket
                </Link>
            </div>

            <div className="w-full">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
                    <form onSubmit={submit} className="space-y-6">

                        {/* ── Tipe Paket ── */}
                        <div>
                            <InputLabel htmlFor="tipe" value="Tipe Paket" />
                            <div className="mt-2 flex gap-3">
                                {[{ value: 'latihan', label: '📚 Latihan Soal', desc: 'Siswa bisa latihan kapan saja' },
                                  { value: 'tryout',  label: '🎯 Try Out UTBK',  desc: 'Ujian terjadwal & terstruktur' }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleTipeChange({ target: { value: opt.value } })}
                                        className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                            data.tipe === opt.value
                                                ? opt.value === 'tryout'
                                                    ? 'border-amber-400 bg-amber-50 shadow-sm'
                                                    : 'border-[#1b5e20] bg-emerald-50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="font-semibold text-sm text-slate-800">{opt.label}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.tipe} className="mt-2" />
                        </div>

                        {/* ── Nama Paket ── */}
                        <div>
                            <InputLabel htmlFor="nama_paket" value={isTryout ? 'Nama Try Out' : 'Nama Paket'} />
                            <TextInput
                                id="nama_paket"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.nama_paket}
                                onChange={(e) => setData('nama_paket', e.target.value)}
                                placeholder={isTryout ? 'Contoh: Try Out UTBK Simulasi 1' : 'Contoh: Latihan PPU Intensif'}
                                required
                            />
                            <InputError message={errors.nama_paket} className="mt-2" />
                        </div>

                        {/* ── Deskripsi ── */}
                        <div>
                            <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                            <textarea
                                id="deskripsi"
                                className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                rows={3}
                                value={data.deskripsi}
                                placeholder={isTryout ? 'Deskripsi singkat try out ini...' : 'Deskripsi singkat paket latihan...'}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                            />
                            <InputError message={errors.deskripsi} className="mt-2" />
                        </div>

                        {/* ════════════════════════════════════════════════════
                            SECTION KHUSUS TRY OUT
                        ════════════════════════════════════════════════════ */}
                        {isTryout ? (
                            <>
                                {/* ── Tanggal Mulai & Selesai ── */}
                                <SectionCard icon={Calendar} title="Jadwal Pengerjaan" accent="blue">
                                    <p className="text-xs text-slate-500 -mt-2">
                                        Siswa hanya bisa mengerjakan try out dalam rentang waktu ini.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="tanggal_mulai" value="Tanggal & Jam Mulai" />
                                            <TextInput
                                                id="tanggal_mulai"
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.tanggal_mulai}
                                                min={minDateTime}
                                                onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.tanggal_mulai} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="tanggal_selesai" value="Tanggal & Jam Selesai" />
                                            <TextInput
                                                id="tanggal_selesai"
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.tanggal_selesai}
                                                min={data.tanggal_mulai || minDateTime}
                                                onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.tanggal_selesai} className="mt-2" />
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* ── Durasi Pengerjaan (Informasi) ── */}
                                <SectionCard icon={Clock} title="Durasi Pengerjaan" accent="slate">
                                    <div className="flex items-center justify-between -mt-2">
                                        <p className="text-xs text-slate-500">
                                            Sesuai standar UTBK — <span className="font-semibold text-slate-700">Total {TOTAL_MENIT} menit</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowDurasi(!showDurasi)}
                                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                                        >
                                            {showDurasi ? 'Sembunyikan' : 'Lihat detail'}
                                            {showDurasi ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        </button>
                                    </div>
                                    {showDurasi && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                                            {UTBK_SUBTESTS.map(s => (
                                                <div key={s.kode} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-center">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.kode}</div>
                                                    <div className="text-xs text-slate-600 mt-0.5 leading-snug">{s.nama}</div>
                                                    <div className="text-sm font-bold text-[#1b5e20] mt-1">{s.menit} mnt</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        ℹ️ Durasi per subtes tidak bisa diubah karena mengikuti standar resmi SNPMB/UTBK.
                                    </p>
                                </SectionCard>

                                {/* ── Pengaturan Soal ── */}
                                <SectionCard icon={Shuffle} title="Pengaturan Soal" accent="slate">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Randomisasi Soal</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Urutan soal dan subtes diacak untuk setiap siswa</p>
                                        </div>
                                        <ToggleSwitch
                                            id="is_random"
                                            checked={data.is_random}
                                            onChange={(v) => setData('is_random', v)}
                                        />
                                    </div>
                                    <InputError message={errors.is_random} className="mt-1" />
                                </SectionCard>

                                {/* ── Aturan Pengerjaan ── */}
                                <SectionCard icon={PauseCircle} title="Aturan Pengerjaan" accent="slate">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Siswa Bisa Pause?</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Jika diaktifkan, siswa bisa menjeda pengerjaan dan melanjutkan nanti</p>
                                        </div>
                                        <ToggleSwitch
                                            id="bisa_pause"
                                            checked={data.bisa_pause}
                                            onChange={(v) => setData('bisa_pause', v)}
                                        />
                                    </div>
                                    <InputError message={errors.bisa_pause} className="mt-1" />
                                </SectionCard>

                                {/* ── Hasil & Pembahasan ── */}
                                <SectionCard icon={BookOpen} title="Hasil &amp; Pembahasan" accent="green">
                                    <p className="text-xs text-slate-500 -mt-2">
                                        Kapan hasil skor dan pembahasan soal ditampilkan ke siswa?
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {[
                                            { value: 'setelah_selesai', label: 'Setelah Siswa Selesai', desc: 'Langsung muncul begitu siswa submit jawaban' },
                                            { value: 'terjadwal',       label: '📅 Terjadwal (Bareng-bareng)', desc: 'Semua siswa bisa lihat hasil di waktu yang sama' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setData('tampil_hasil', opt.value)}
                                                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                                    data.tampil_hasil === opt.value
                                                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm text-slate-800">{opt.label}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {data.tampil_hasil === 'terjadwal' && (
                                        <div className="mt-3 p-4 bg-white border border-emerald-200 rounded-xl">
                                            <InputLabel htmlFor="tanggal_tampil_hasil" value="Jadwal Tampil Hasil" />
                                            <TextInput
                                                id="tanggal_tampil_hasil"
                                                type="datetime-local"
                                                className="mt-1 block w-full sm:w-72"
                                                value={data.tanggal_tampil_hasil}
                                                min={data.tanggal_selesai || minDateTime}
                                                onChange={(e) => setData('tanggal_tampil_hasil', e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                Sebaiknya setelah tanggal selesai try out.
                                            </p>
                                            <InputError message={errors.tanggal_tampil_hasil} className="mt-2" />
                                        </div>
                                    )}
                                    <InputError message={errors.tampil_hasil} className="mt-1" />
                                </SectionCard>

                                {/* ── Status Aktivasi (untuk Tryout) ── */}
                                <SectionCard icon={Clock} title="Jadwal Aktivasi Paket" accent="amber">
                                    <p className="text-xs text-slate-500 -mt-2">
                                        Opsional — isi jika sudah tahu kapan paket ini mulai terlihat siswa. Bisa diisi nanti saat edit.
                                    </p>
                                    <div>
                                        <InputLabel htmlFor="tanggal_aktif" value="Aktif Otomatis Pada (opsional)" />
                                        <TextInput
                                            id="tanggal_aktif"
                                            type="datetime-local"
                                            className="mt-1 block w-full sm:w-80"
                                            value={data.tanggal_aktif}
                                            min={minDateTime}
                                            onChange={(e) => setData('tanggal_aktif', e.target.value)}
                                        />
                                        <InputError message={errors.tanggal_aktif} className="mt-2" />
                                    </div>
                                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        {data.tanggal_aktif
                                            ? `⏰ Paket akan otomatis aktif dan siswa mendapat notifikasi pada ${new Date(data.tanggal_aktif).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}.`
                                            : '📌 Paket disimpan sebagai nonaktif. Kamu bisa aktifkan manual atau set jadwal nanti dari halaman edit.'
                                        }
                                    </p>
                                </SectionCard>
                            </>
                        ) : (
                            /* ════════════════════════════════════════════════
                               SECTION LATIHAN SOAL (SEDERHANA)
                            ════════════════════════════════════════════════ */
                            <>
                                {/* Waktu Ujian */}
                                <div>
                                    <InputLabel htmlFor="waktu_ujian" value="Waktu Ujian (Menit)" />
                                    <TextInput
                                        id="waktu_ujian"
                                        type="number"
                                        min="0"
                                        className="mt-1 block w-full sm:w-48"
                                        value={data.waktu_ujian}
                                        onChange={(e) => setData('waktu_ujian', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Biarkan 0 jika waktu tidak dibatasi.</p>
                                    <InputError message={errors.waktu_ujian} className="mt-2" />
                                </div>

                                {/* Status Aktivasi */}
                                <div>
                                    <InputLabel value="Status Aktivasi" />
                                    <p className="text-xs text-slate-400 mt-0.5 mb-3">
                                        Pilih apakah paket langsung aktif, nonaktif, atau dijadwalkan.
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {latMode.map(mode => (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                onClick={() => handleStatusMode(mode.value)}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                                    statusMode === mode.value
                                                        ? mode.value === 'aktif'
                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                            : mode.value === 'terjadwal'
                                                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                            : 'bg-slate-500 border-slate-500 text-white shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                    {statusMode === 'terjadwal' && (
                                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock size={16} className="text-amber-600" />
                                                <span className="text-sm font-semibold text-amber-800">Jadwal Aktivasi Otomatis</span>
                                            </div>
                                            <TextInput
                                                id="tanggal_aktif"
                                                type="datetime-local"
                                                className="block w-full sm:w-72"
                                                value={data.tanggal_aktif}
                                                min={minDateTime}
                                                onChange={(e) => setData('tanggal_aktif', e.target.value)}
                                                required={statusMode === 'terjadwal'}
                                            />
                                            <p className="text-xs text-amber-700 mt-2">
                                                Paket akan otomatis diaktifkan pada tanggal &amp; jam yang dipilih.
                                            </p>
                                            <InputError message={errors.tanggal_aktif} className="mt-2" />
                                        </div>
                                    )}
                                    {statusMode === 'aktif' && (
                                        <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 inline-block">
                                            ✓ Paket langsung aktif dan bisa diakses siswa setelah disimpan.
                                        </p>
                                    )}
                                    {statusMode === 'nonaktif' && (
                                        <p className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 inline-block">
                                            Paket disimpan tapi belum bisa diakses siswa. Kamu bisa aktifkan manual nanti.
                                        </p>
                                    )}
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                            </>
                        )}

                        {/* ── Actions ── */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                            <Link
                                href={route('paket-latihan.index')}
                                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`text-white px-8 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
                                    isTryout
                                        ? 'bg-amber-500 hover:bg-amber-600'
                                        : 'bg-[#1b5e20] hover:bg-[#508953]'
                                }`}
                            >
                                <Save size={18} />
                                {isTryout ? 'Simpan Try Out' : 'Simpan & Kelola Soal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
