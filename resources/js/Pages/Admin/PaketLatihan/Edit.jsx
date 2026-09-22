import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save, Trash2, Plus, Search, Clock, Calendar, Shuffle, PauseCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import ContainerWhite from '@/Components/ContainerWhite';

export default function Edit({ auth, paket, soals = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDurasi, setShowDurasi]   = useState(false);

    const isTryout = paket?.tipe === 'tryout';

    // Tentukan mode awal berdasarkan data paket
    const getInitialMode = () => {
        if (paket?.tanggal_aktif) return 'terjadwal';
        if (paket?.status === 'aktif' || paket?.status === 'Aktif') return isTryout ? 'nonaktif' : 'aktif';
        return 'nonaktif';
    };
    const [statusMode, setStatusMode] = useState(getInitialMode);

    const filteredSoals = soals.filter((s) =>
        s.konten_soal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kategori?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.materi?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toDateTime = (val) => val ? new Date(val).toISOString().slice(0, 16) : '';

    const { data, setData, put, processing, errors } = useForm({
        nama_paket:           paket?.nama_paket  || '',
        deskripsi:            paket?.deskripsi   || '',
        tipe:                 paket?.tipe        || 'latihan',
        status:               paket?.status      || 'aktif',
        waktu_ujian:          paket?.waktu_ujian || 0,
        tanggal_aktif:        toDateTime(paket?.tanggal_aktif),
        // Tryout fields
        tanggal_mulai:        toDateTime(paket?.tanggal_mulai),
        tanggal_selesai:      toDateTime(paket?.tanggal_selesai),
        is_random:            paket?.is_random   ?? false,
        bisa_pause:           paket?.bisa_pause  ?? true,
        tampil_hasil:         paket?.tampil_hasil || 'setelah_selesai',
        tanggal_tampil_hasil: toDateTime(paket?.tanggal_tampil_hasil),
    });

    // Konstanta Durasi Standar UTBK
    const UTBK_SUBTESTS = [
        { kode: 'PU',    nama: 'Penalaran Umum',               menit: 30 },
        { kode: 'PPU',   nama: 'Pengetahuan & Pemahaman Umum',  menit: 35 },
        { kode: 'PK',    nama: 'Pengetahuan Kuantitatif',       menit: 40 },
        { kode: 'PBM',   nama: 'Pemahaman Bacaan & Menulis',    menit: 35 },
        { kode: 'LBI',   nama: 'Literasi Bahasa Indonesia',     menit: 45 },
        { kode: 'LBIng', nama: 'Literasi Bahasa Inggris',       menit: 35 },
        { kode: 'PM',    nama: 'Penalaran Matematika',          menit: 45 },
    ];
    const TOTAL_MENIT = UTBK_SUBTESTS.reduce((s, t) => s + t.menit, 0);

    const latMode = [
        { value: 'aktif',     label: 'Aktif Sekarang' },
        { value: 'nonaktif',  label: 'Nonaktif'        },
        { value: 'terjadwal', label: '⏰ Jadwalkan'    },
    ];
    const toMode = [
        { value: 'nonaktif',  label: 'Aktifkan Nanti (Manual)' },
        { value: 'terjadwal', label: '⏰ Jadwalkan Otomatis'   },
    ];
    const STATUS_MODES = isTryout ? toMode : latMode;

    const handleStatusMode = (mode) => {
        setStatusMode(mode);
        if (mode === 'aktif') {
            setData(d => ({ ...d, status: 'aktif', tanggal_aktif: '' }));
        } else if (mode === 'nonaktif') {
            setData(d => ({ ...d, status: 'nonaktif', tanggal_aktif: '' }));
        } else {
            setData(d => ({ ...d, status: 'nonaktif' }));
        }
    };

    // Toggle Switch component
    const ToggleSwitch = ({ checked, onChange, id }) => (
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

    // Section Card
    const SectionCard = ({ icon: Icon, title, children, accent = 'slate' }) => {
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
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('paket-latihan.update', paket.id_paket));
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Hapus Paket Latihan?',
            text: 'Seluruh soal dan data sesi latihan siswa yang terhubung dengan paket ini akan dihapus secara permanen.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-3xl p-6 shadow-xl',
                confirmButton: 'rounded-xl px-5 py-3 font-medium text-sm',
                cancelButton: 'rounded-xl px-5 py-3 font-medium text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('paket-latihan.destroy', paket.id_paket), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Paket latihan berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#1b5e20',
                            customClass: {
                                popup: 'rounded-3xl p-6 shadow-xl',
                                confirmButton: 'rounded-xl px-5 py-3 font-medium text-sm'
                            }
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Edit Paket Latihan">
            <Head title="Edit Paket" />

            <div className="mb-6">
                <Link
                    href={route('paket-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Paket
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                <div className="w-full">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Nama Paket */}
                            <div>
                                <InputLabel htmlFor="nama_paket" value={isTryout ? 'Nama Try Out' : 'Nama Paket'} />
                                <TextInput
                                    id="nama_paket"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.nama_paket}
                                    onChange={(e) => setData('nama_paket', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nama_paket} className="mt-2" />
                            </div>

                            {/* Tipe — hanya tampil sebagai label read-only di edit */}
                            <div>
                                <InputLabel value="Tipe Paket" />
                                <div className={`mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border ${
                                    isTryout
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                    {isTryout ? '🎯 Try Out UTBK' : '📚 Latihan Soal'}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Tipe tidak bisa diubah setelah paket dibuat.</p>
                                <input type="hidden" name="tipe" value={data.tipe} />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                                <textarea
                                    id="deskripsi"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    rows={3}
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                />
                                <InputError message={errors.deskripsi} className="mt-2" />
                            </div>

                            {/* ══ TRYOUT FIELDS ══ */}
                            {isTryout ? (
                                <>
                                    {/* Tanggal Mulai & Selesai */}
                                    <SectionCard icon={Calendar} title="Jadwal Pengerjaan" accent="blue">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="tanggal_mulai" value="Tanggal & Jam Mulai" />
                                                <TextInput
                                                    id="tanggal_mulai"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full"
                                                    value={data.tanggal_mulai}
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
                                                    min={data.tanggal_mulai}
                                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_selesai} className="mt-2" />
                                            </div>
                                        </div>
                                    </SectionCard>

                                    {/* Durasi (info saja) */}
                                    <SectionCard icon={Clock} title="Durasi Pengerjaan" accent="slate">
                                        <div className="flex items-center justify-between -mt-2">
                                            <p className="text-xs text-slate-500">
                                                Standar UTBK — <span className="font-semibold text-slate-700">Total {TOTAL_MENIT} menit</span>
                                            </p>
                                            <button type="button" onClick={() => setShowDurasi(!showDurasi)}
                                                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                                {showDurasi ? 'Sembunyikan' : 'Lihat detail'}
                                                {showDurasi ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
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
                                        <p className="text-[11px] text-slate-400">ℹ️ Durasi per subtes tidak bisa diubah karena mengikuti standar resmi SNPMB/UTBK.</p>
                                    </SectionCard>

                                    {/* Randomisasi */}
                                    <SectionCard icon={Shuffle} title="Pengaturan Soal" accent="slate">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Randomisasi Soal</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Urutan soal dan subtes diacak untuk setiap siswa</p>
                                            </div>
                                            <ToggleSwitch id="is_random" checked={data.is_random} onChange={(v) => setData('is_random', v)} />
                                        </div>
                                        <InputError message={errors.is_random} className="mt-1" />
                                    </SectionCard>

                                    {/* Bisa Pause */}
                                    <SectionCard icon={PauseCircle} title="Aturan Pengerjaan" accent="slate">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Siswa Bisa Pause?</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Jika diaktifkan, siswa bisa menjeda pengerjaan dan melanjutkan nanti</p>
                                            </div>
                                            <ToggleSwitch id="bisa_pause" checked={data.bisa_pause} onChange={(v) => setData('bisa_pause', v)} />
                                        </div>
                                        <InputError message={errors.bisa_pause} className="mt-1" />
                                    </SectionCard>

                                    {/* Hasil & Pembahasan */}
                                    <SectionCard icon={BookOpen} title="Hasil & Pembahasan" accent="green">
                                        <p className="text-xs text-slate-500 -mt-2">Kapan hasil skor dan pembahasan soal ditampilkan ke siswa?</p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {[
                                                { value: 'setelah_selesai', label: 'Setelah Siswa Selesai', desc: 'Langsung muncul begitu siswa submit jawaban' },
                                                { value: 'terjadwal',       label: '📅 Terjadwal (Bareng-bareng)', desc: 'Semua siswa bisa lihat hasil di waktu yang sama' },
                                            ].map(opt => (
                                                <button key={opt.value} type="button" onClick={() => setData('tampil_hasil', opt.value)}
                                                    className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                                        data.tampil_hasil === opt.value
                                                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}>
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
                                                    min={data.tanggal_selesai}
                                                    onChange={(e) => setData('tanggal_tampil_hasil', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_tampil_hasil} className="mt-2" />
                                            </div>
                                        )}
                                        <InputError message={errors.tampil_hasil} className="mt-1" />
                                    </SectionCard>

                                    {/* Status Aktivasi (tryout) */}
                                    <SectionCard icon={Clock} title="Status Aktivasi" accent="amber">
                                        <p className="text-xs text-slate-500 -mt-2">Kapan paket ini mulai terlihat oleh siswa?</p>
                                        <div className="flex gap-3 flex-wrap">
                                            {STATUS_MODES.map(mode => (
                                                <button key={mode.value} type="button" onClick={() => handleStatusMode(mode.value)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                                        statusMode === mode.value
                                                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}>
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                        {statusMode === 'terjadwal' && (
                                            <div className="mt-3 p-4 bg-white border border-amber-200 rounded-xl">
                                                <InputLabel htmlFor="tanggal_aktif" value="Jadwal Paket Mulai Terlihat Siswa" />
                                                <TextInput
                                                    id="tanggal_aktif"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full sm:w-72"
                                                    value={data.tanggal_aktif}
                                                    onChange={(e) => setData('tanggal_aktif', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_aktif} className="mt-2" />
                                            </div>
                                        )}
                                        {statusMode === 'nonaktif' && (
                                            <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 inline-block">
                                                Paket tersimpan tapi belum terlihat siswa.
                                            </p>
                                        )}
                                        <InputError message={errors.status} className="mt-1" />
                                    </SectionCard>
                                </>
                            ) : (
                                /* ══ LATIHAN SOAL FIELDS ══ */
                                <>
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
                                        <p className="text-xs text-slate-500 mt-1">Biarkan 0 jika waktu ujian tidak dibatasi.</p>
                                        <InputError message={errors.waktu_ujian} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel value="Status Aktivasi" />
                                        <p className="text-xs text-slate-400 mt-0.5 mb-3">
                                            Pilih apakah paket langsung aktif, nonaktif, atau dijadwalkan.
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {STATUS_MODES.map(mode => (
                                                <button key={mode.value} type="button" onClick={() => handleStatusMode(mode.value)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                                        statusMode === mode.value
                                                            ? mode.value === 'aktif' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                                : mode.value === 'terjadwal' ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                                : 'bg-slate-500 border-slate-500 text-white shadow-sm'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}>
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                        {statusMode === 'terjadwal' && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <InputLabel htmlFor="tanggal_aktif" value="Jadwal Aktivasi" />
                                                <TextInput
                                                    id="tanggal_aktif"
                                                    type="datetime-local"
                                                    className="mt-1 block w-full sm:w-72"
                                                    value={data.tanggal_aktif}
                                                    onChange={(e) => setData('tanggal_aktif', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.tanggal_aktif} className="mt-2" />
                                            </div>
                                        )}
                                        {statusMode === 'aktif' && (
                                            <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 inline-block">
                                                ✓ Paket langsung aktif dan bisa diakses siswa.
                                            </p>
                                        )}
                                        {statusMode === 'nonaktif' && (
                                            <p className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 inline-block">
                                                Paket tidak bisa diakses siswa sampai diaktifkan.
                                            </p>
                                        )}
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-medium transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Hapus Paket
                                </button>
                                <div className="flex items-center gap-4">
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
                                            isTryout ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1b5e20] hover:bg-[#508953]'
                                        }`}
                                    >
                                        <Save size={18} />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-full lg:w-[520px] shrink-0">
                    <ContainerWhite className="sticky top-4">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <h4 className="text-base font-semibold text-slate-800">Daftar Soal</h4>
                                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-md">
                                    {soals.length} soal
                                </span>
                            </div>
                            <Link
                                href={route('paket-latihan.show', paket.id_paket)}
                                className="flex items-center gap-1.5 text-sm text-white bg-[#1b5e20] hover:bg-[#144718] px-3.5 py-2 rounded-xl font-medium transition-colors"
                            >
                                <Plus size={14} />
                                Kelola Soal
                            </Link>
                        </div>

                        {/* Search */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mb-4 focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-colors">
                            <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari soal..."
                                className="bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-700 w-full placeholder-slate-400 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Soal List */}
                        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                            {filteredSoals.length > 0 ? (
                                filteredSoals.map((soal, idx) => (
                                    <div
                                        key={soal.id_soal}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
                                    >
                                        {/* Nomor */}
                                        <span className="text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5">
                                            {idx + 1}.
                                        </span>

                                        {/* Konten */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 line-clamp-2 leading-snug">
                                                {soal.konten_soal?.replace(/<[^>]+>/g, '') || '(Soal tanpa teks)'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                {soal.kategori && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20]">
                                                        {soal.kategori}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 uppercase font-medium">
                                                    {soal.jenis_soal === 'pilihan_ganda' ? 'PG' : 'Isian'}
                                                </span>
                                                {soal.tingkat_kesulitan && (
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${soal.tingkat_kesulitan === 'mudah' ? 'bg-emerald-50 text-emerald-700' :
                                                        soal.tingkat_kesulitan === 'sulit' ? 'bg-rose-50 text-rose-700' :
                                                            'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {soal.tingkat_kesulitan === 'mudah' ? 'Mudah' : soal.tingkat_kesulitan === 'sulit' ? 'Sulit' : 'Sedang'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit link */}
                                        <Link
                                            href={route('soal.edit', soal.id_soal)}
                                            className="shrink-0 text-slate-300 hover:text-[#1b5e20] transition-colors opacity-0 group-hover:opacity-100"
                                            title="Edit soal"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    {searchQuery ? `Tidak ada soal yang cocok dengan "${searchQuery}".` : 'Belum ada soal di paket ini.'}
                                </div>
                            )}
                        </div>
                    </ContainerWhite>
                </div>
            </div>
        </AdminLayout>
    );
}
