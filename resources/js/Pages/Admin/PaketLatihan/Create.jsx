import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SecondIcon from '@/Components/SecondIcon';
import FirstIcon from '@/Components/FirstIcon';
import { ArrowLeft, Save, Clock, Calendar, Shuffle, PauseCircle, BookOpen, ChevronDown, ChevronUp, Info, RotateCcw } from 'lucide-react';
import ContainerWhite from '@/Components/ContainerWhite';
import ContainerGreen from '@/Components/ContainerGreen';
import PrimaryButton from '@/Components/PrimaryButton';

// ─── Konstanta Durasi Standar UTBK (Resmi 195 Menit / 3 Jam 15 Menit) ─────────
const DEFAULT_UTBK_SUBTESTS = [
    { kode: 'PU',   nama: 'Penalaran Umum',              menit: 30 },
    { kode: 'PPU',  nama: 'Pengetahuan & Pemahaman Umum', menit: 15 },
    { kode: 'PBM',  nama: 'Pemahaman Bacaan & Menulis',   menit: 25 },
    { kode: 'PK',   nama: 'Pengetahuan Kuantitatif',      menit: 20 },
    { kode: 'LBI',  nama: 'Literasi Bahasa Indonesia',    menit: 45 },
    { kode: 'LBIng',nama: 'Literasi Bahasa Inggris',      menit: 20 },
    { kode: 'PM',   nama: 'Penalaran Matematika',         menit: 40 },
];
const STORAGE_KEY_SUBTESTS = 'tb_admin_utbk_subtests';

const getInitialSubtests = () => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_SUBTESTS);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length === DEFAULT_UTBK_SUBTESTS.length) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Error reading saved subtests:', e);
        }
    }
    return DEFAULT_UTBK_SUBTESTS;
};

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
        <div className={`rounded-2xl border p-6 ${colors[accent]}`}>
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
export default function Create({ auth, defaultTipe = 'latihan' }) {
    const [subtests, setSubtests]                   = useState(getInitialSubtests);
    const totalMenitSubtest                         = subtests.reduce((acc, curr) => acc + (parseInt(curr.menit, 10) || 0), 0);
    const [statusMode, setStatusMode]               = useState(defaultTipe === 'tryout' ? 'nonaktif' : 'aktif');
    const [showDurasi, setShowDurasi]               = useState(true);

    const { data, setData, post, processing, errors } = useForm({
        nama_paket:           '',
        deskripsi:            '',
        tipe:                 defaultTipe,
        status:               defaultTipe === 'tryout' ? 'nonaktif' : 'aktif',
        waktu_ujian:          defaultTipe === 'tryout' ? totalMenitSubtest : 0,
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

    const handleSubtestChange = (kode, valStr) => {
        const val = valStr === '' ? '' : Math.max(0, parseInt(valStr, 10) || 0);
        const updated = subtests.map(s => s.kode === kode ? { ...s, menit: val } : s);
        setSubtests(updated);
        const newTotal = updated.reduce((acc, curr) => acc + (parseInt(curr.menit, 10) || 0), 0);
        setData('waktu_ujian', newTotal);

        try {
            localStorage.setItem(STORAGE_KEY_SUBTESTS, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save subtests to localStorage:', e);
        }
    };

    const handleResetDefaultDurasi = () => {
        setSubtests(DEFAULT_UTBK_SUBTESTS);
        const defTotal = DEFAULT_UTBK_SUBTESTS.reduce((acc, curr) => acc + (parseInt(curr.menit, 10) || 0), 0);
        setData('waktu_ujian', defTotal);
        try {
            localStorage.setItem(STORAGE_KEY_SUBTESTS, JSON.stringify(DEFAULT_UTBK_SUBTESTS));
        } catch (e) {
            console.error('Failed to reset subtests in localStorage:', e);
        }
    };

    const [tryoutActMode, setTryoutActMode]         = useState('sesuai_mulai'); // 'sesuai_mulai' | 'terjadwal'

    const handleTryoutActMode = (mode) => {
        setTryoutActMode(mode);
        if (mode === 'sesuai_mulai') {
            setData(d => ({
                ...d,
                status: 'nonaktif',
                tanggal_aktif: d.tanggal_mulai || '',
            }));
        } else {
            setData(d => ({
                ...d,
                status: 'nonaktif',
                tanggal_aktif: d.tanggal_aktif || minDateTime,
            }));
        }
    };

    // Saat tipe berubah, reset state yang relevan
    const handleTipeChange = (e) => {
        const val = e.target.value;
        setData(d => ({ ...d, tipe: val }));
        if (val === 'tryout') {
            setData(d => ({
                ...d,
                tipe: val,
                status: 'nonaktif',
                tanggal_aktif: tryoutActMode === 'sesuai_mulai' ? (d.tanggal_mulai || '') : (d.tanggal_aktif || minDateTime),
            }));
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
        { value: 'terjadwal', label: 'Jadwalkan'       },
    ];
    const toMode = [
        { value: 'nonaktif',  label: 'Aktifkan Nanti (Manual)' },
        { value: 'terjadwal', label: 'Jadwalkan Otomatis'      },
    ];
    const statusModes = isTryout ? toMode : latMode;

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3.5">
                    <Link href={isTryout ? route('paket-tryout.index') : route('paket-latihan.index')}>
                        <PrimaryButton className="gap-2 !py-2 !px-4 text-xs sm:text-sm font-semibold shadow-sm hover:shadow">
                            <ArrowLeft size={16} />
                            Kembali
                        </PrimaryButton>
                    </Link>
                    <span>{isTryout ? 'Buat Try Out Baru' : 'Tambah Paket Latihan'}</span>
                </div>
            }
        >
            <Head title={isTryout ? 'Buat Try Out' : 'Tambah Paket'} />

            <div className="w-full">
                <ContainerWhite className="w-full !p-6 md:!p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Hidden field tipe paket (otomatis sesuai navigasi) */}
                        <input type="hidden" name="tipe" value={data.tipe} />

                        {isTryout ? (
                            /* ════════════════════════════════════════════════════
                               LAYOUT 2 KOLOM KHUSUS TRY OUT
                            ════════════════════════════════════════════════════ */
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {/* ── KOLOM 1: Judul, Deskripsi, Jadwal, Hasil & Pembahasan, Status Aktivasi ── */}
                                <div className="flex flex-col gap-y-8 lg:gap-y-9">
                                    {/* Nama Try Out & Deskripsi */}
                                    <div className="space-y-5">
                                        <div>
                                            <InputLabel htmlFor="nama_paket" value="Nama Try Out" />
                                            <TextInput
                                                id="nama_paket"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.nama_paket}
                                                onChange={(e) => setData('nama_paket', e.target.value)}
                                                placeholder="Contoh: Try Out UTBK Simulasi 1"
                                                required
                                            />
                                            <InputError message={errors.nama_paket} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                                            <textarea
                                                id="deskripsi"
                                                className="rounded-xl border-slate-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] shadow-sm mt-1 block w-full text-sm"
                                                rows={3}
                                                value={data.deskripsi}
                                                placeholder="Deskripsi singkat try out ini..."
                                                onChange={(e) => setData('deskripsi', e.target.value)}
                                            />
                                            <InputError message={errors.deskripsi} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Jadwal Pengerjaan */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <SecondIcon icon={Calendar} iconSize={18} />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                                    Jadwal Pengerjaan
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Siswa hanya bisa mengerjakan try out dalam rentang waktu ini.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="tanggal_mulai" value="Tanggal & Jam Mulai" />
                                                <TextInput
                                                    id="tanggal_mulai"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full text-sm"
                                                    value={data.tanggal_mulai}
                                                    min={minDateTime}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setData(d => ({
                                                            ...d,
                                                            tanggal_mulai: val,
                                                            tanggal_aktif: tryoutActMode === 'sesuai_mulai' ? val : d.tanggal_aktif,
                                                        }));
                                                    }}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_mulai} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="tanggal_selesai" value="Tanggal & Jam Selesai" />
                                                <TextInput
                                                    id="tanggal_selesai"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full text-sm"
                                                    value={data.tanggal_selesai}
                                                    min={data.tanggal_mulai || minDateTime}
                                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_selesai} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hasil & Pembahasan */}
                                    <div className="space-y-4 pt-3">
                                        <div className="flex items-center gap-3">
                                            <SecondIcon icon={BookOpen} iconSize={18} />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                                    Hasil &amp; Pembahasan
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Kapan hasil skor dan pembahasan soal ditampilkan ke siswa?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 pt-1">
                                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="radio"
                                                    name="tampil_hasil"
                                                    value="setelah_selesai"
                                                    checked={data.tampil_hasil === 'setelah_selesai'}
                                                    onChange={() => setData('tampil_hasil', 'setelah_selesai')}
                                                    className="w-4 h-4 text-[#1b5e20] border-slate-300 focus:ring-[#1b5e20] focus:ring-offset-0 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Setelah Siswa Selesai</span>
                                            </label>
                                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="radio"
                                                    name="tampil_hasil"
                                                    value="terjadwal"
                                                    checked={data.tampil_hasil === 'terjadwal'}
                                                    onChange={() => setData('tampil_hasil', 'terjadwal')}
                                                    className="w-4 h-4 text-[#1b5e20] border-slate-300 focus:ring-[#1b5e20] focus:ring-offset-0 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Terjadwal (Bersamaan)</span>
                                            </label>
                                        </div>
                                        {data.tampil_hasil === 'terjadwal' && (
                                            <div className="pt-1">
                                                <InputLabel htmlFor="tanggal_tampil_hasil" value="Jadwal Tampil Hasil" />
                                                <TextInput
                                                    id="tanggal_tampil_hasil"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full sm:w-72 text-sm"
                                                    value={data.tanggal_tampil_hasil}
                                                    min={data.tanggal_selesai || minDateTime}
                                                    onChange={(e) => setData('tanggal_tampil_hasil', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_tampil_hasil} className="mt-2" />
                                            </div>
                                        )}
                                        <InputError message={errors.tampil_hasil} className="mt-1" />
                                    </div>

                                    {/* Status Aktivasi (Pindah ke kiri) */}
                                    <div className="space-y-4 pt-3">
                                        <div className="flex items-center gap-3">
                                            <SecondIcon icon={Clock} iconSize={18} />
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                                    Status Aktivasi
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Kapan paket Try Out ini mulai terlihat oleh siswa di antarmukanya?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 pt-1">
                                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="radio"
                                                    name="tryout_act_mode"
                                                    value="sesuai_mulai"
                                                    checked={tryoutActMode === 'sesuai_mulai'}
                                                    onChange={() => handleTryoutActMode('sesuai_mulai')}
                                                    className="w-4 h-4 text-[#1b5e20] border-slate-300 focus:ring-[#1b5e20] focus:ring-offset-0 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-slate-700">
                                                    Sesuai Jadwal Pengerjaan TO
                                                </span>
                                            </label>
                                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="radio"
                                                    name="tryout_act_mode"
                                                    value="terjadwal"
                                                    checked={tryoutActMode === 'terjadwal'}
                                                    onChange={() => handleTryoutActMode('terjadwal')}
                                                    className="w-4 h-4 text-[#1b5e20] border-slate-300 focus:ring-[#1b5e20] focus:ring-offset-0 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-slate-700">
                                                    Terjadwal
                                                </span>
                                            </label>
                                        </div>

                                        {tryoutActMode === 'sesuai_mulai' && (
                                            <div className="pt-1">
                                                <InputLabel htmlFor="tanggal_aktif_preview" value="Jadwal Paket Terlihat Siswa" />
                                                <TextInput
                                                    id="tanggal_aktif_preview"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full sm:w-72 text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed border-slate-200"
                                                    value={data.tanggal_mulai || ''}
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                        )}

                                        {tryoutActMode === 'terjadwal' && (
                                            <div className="pt-1">
                                                <InputLabel htmlFor="tanggal_aktif" value="Jadwal Paket Terlihat Siswa" />
                                                <TextInput
                                                    id="tanggal_aktif"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full sm:w-72 text-sm"
                                                    value={data.tanggal_aktif}
                                                    min={minDateTime}
                                                    max={data.tanggal_mulai || undefined}
                                                    onChange={(e) => setData('tanggal_aktif', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_aktif} className="mt-2" />
                                            </div>
                                        )}
                                        <InputError message={errors.status} className="mt-1" />
                                    </div>
                                </div>

                                {/* ── KOLOM 2: Durasi, Pengaturan Soal, Aturan Pengerjaan, Tombol Simpan ── */}
                                <div className="flex flex-col gap-y-8 lg:gap-y-9">
                                    {/* Durasi Pengerjaan */}
                                    <ContainerGreen className="cursor-default hover:translate-y-0 !p-6 sm:!p-6 !rounded-2xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <FirstIcon
                                                    icon={Clock}
                                                    iconSize={18}
                                                    className="!w-9 !h-9 !rounded-xl !bg-[#fcc526] !text-slate-900 shadow-md group-hover:!bg-[#eab522] group-hover:!text-slate-950"
                                                />
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                                                    Durasi Pengerjaan
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <PrimaryButton
                                                    type="button"
                                                    onClick={handleResetDefaultDurasi}
                                                    title="Kembalikan durasi ke standar UTBK (195 Menit)"
                                                    className="gap-1.5 !py-1.5 !px-3.5 !text-xs font-semibold !rounded-xl !bg-[#144718] hover:!bg-[#0d2e0f] !border-0 text-white shadow-xs cursor-pointer"
                                                >
                                                    <RotateCcw size={12} />
                                                    Reset Standar
                                                </PrimaryButton>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDurasi(!showDurasi)}
                                                    className="text-xs text-emerald-100 hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-medium ml-1"
                                                >
                                                    {showDurasi ? 'Sembunyikan' : 'Sesuaikan'}
                                                    {showDurasi ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-xs text-emerald-100">
                                                Total Durasi: <span className="font-bold text-white">{totalMenitSubtest} Menit</span>
                                                <span className="text-[11px] text-emerald-200/80 ml-1.5">
                                                    ({Math.floor(totalMenitSubtest / 60)}j {totalMenitSubtest % 60}m)
                                                </span>
                                            </p>
                                        </div>

                                        {showDurasi && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3.5">
                                                    {subtests.map(s => (
                                                        <ContainerWhite
                                                            key={s.kode}
                                                            className="!p-3.5 !rounded-xl flex items-center justify-between hover:border-[#1b5e20]/40 transition-colors shadow-sm"
                                                        >
                                                            <div className="min-w-0 pr-2">
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fcc526] text-white uppercase tracking-wider shadow-2xs">
                                                                    {s.kode}
                                                                </span>
                                                                <p className="text-xs font-medium text-slate-700 mt-1.5 truncate" title={s.nama}>
                                                                    {s.nama}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <TextInput
                                                                    type="number"
                                                                    min="1"
                                                                    max="240"
                                                                    value={s.menit}
                                                                    onChange={(e) => handleSubtestChange(s.kode, e.target.value)}
                                                                    className="!w-16 !h-8 !text-center !text-xs font-bold text-[#1b5e20] !py-1 !px-1.5 shadow-xs"
                                                                />
                                                                <span className="text-xs text-slate-400 font-medium">mnt</span>
                                                            </div>
                                                        </ContainerWhite>
                                                    ))}
                                                </div>

                                                {/* Informasi durasi per subtes tanpa container, teks putih */}
                                                <div className="flex items-start gap-2 text-xs text-white/90 pt-1">
                                                    <Info size={15} className="shrink-0 text-[#fcc526] mt-0.5" />
                                                    <span className="leading-relaxed">
                                                        Durasi per subtes dapat disesuaikan. Nilai terakhir yang Anda gunakan akan <strong className="text-white font-bold">otomatis tersimpan</strong> dan digunakan kembali untuk pembuatan Try Out berikutnya.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <InputError message={errors.waktu_ujian} className="mt-2 !text-amber-200" />
                                    </ContainerGreen>

                                    {/* Randomisasi Soal */}
                                    <div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <SecondIcon icon={Shuffle} iconSize={18} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Randomisasi Soal</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Urutan soal dan subtes diacak untuk setiap siswa</p>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                id="is_random"
                                                checked={data.is_random}
                                                onChange={(v) => setData('is_random', v)}
                                            />
                                        </div>
                                        <InputError message={errors.is_random} className="mt-1" />
                                    </div>

                                    {/* Siswa Bisa Pause? */}
                                    <div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <SecondIcon icon={PauseCircle} iconSize={18} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Siswa Bisa Pause?</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Jika diaktifkan, siswa bisa menjeda pengerjaan dan melanjutkan nanti</p>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                id="bisa_pause"
                                                checked={data.bisa_pause}
                                                onChange={(v) => setData('bisa_pause', v)}
                                            />
                                        </div>
                                        <InputError message={errors.bisa_pause} className="mt-1" />
                                    </div>

                                    {/* Tombol Simpan & Batal */}
                                    <div className="pt-4 flex items-center justify-end gap-3">
                                        <Link
                                            href={route('paket-tryout.index')}
                                            className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                        >
                                            Batal
                                        </Link>
                                        <PrimaryButton
                                            type="submit"
                                            disabled={processing}
                                            className="gap-2 !py-2.5 !px-6 text-sm font-semibold !rounded-xl shadow-sm hover:shadow"
                                        >
                                            <Save size={18} />
                                            Simpan Try Out
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ════════════════════════════════════════════════
                               SECTION LATIHAN SOAL (SEDERHANA)
                            ════════════════════════════════════════════════ */
                            <div className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama_paket" value="Nama Paket" />
                                    <TextInput
                                        id="nama_paket"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.nama_paket}
                                        onChange={(e) => setData('nama_paket', e.target.value)}
                                        placeholder="Contoh: Latihan PPU Intensif"
                                        required
                                    />
                                    <InputError message={errors.nama_paket} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                                    <textarea
                                        id="deskripsi"
                                        className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                        rows={3}
                                        value={data.deskripsi}
                                        placeholder="Deskripsi singkat paket latihan..."
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                    />
                                    <InputError message={errors.deskripsi} className="mt-2" />
                                </div>

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
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
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
                                            Paket langsung aktif dan bisa diakses siswa setelah disimpan.
                                        </p>
                                    )}
                                    {statusMode === 'nonaktif' && (
                                        <p className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 inline-block">
                                            Paket disimpan tapi belum bisa diakses siswa. Kamu bisa aktifkan manual nanti.
                                        </p>
                                    )}
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Actions Latihan */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                                    <Link
                                        href={route('paket-latihan.index')}
                                        className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                        className="gap-2 !py-2.5 !px-6 text-sm font-semibold !rounded-xl shadow-sm hover:shadow"
                                    >
                                        <Save size={18} />
                                        Simpan & Kelola Soal
                                    </PrimaryButton>
                                </div>
                            </div>
                        )}
                    </form>
                </ContainerWhite>
            </div>
        </AdminLayout>
    );
}
