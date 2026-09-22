import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, XCircle, Search, BookOpen, X, CheckSquare, Clock, Shuffle, PauseCircle } from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Konstanta Subtes UTBK ────────────────────────────────────────────────────
const SUBTES_LIST = [
    { kode: 'PU',    nama: 'Penalaran Umum',               color: 'blue'   },
    { kode: 'PPU',   nama: 'Penget. & Pemahaman Umum',     color: 'purple' },
    { kode: 'PK',    nama: 'Pengetahuan Kuantitatif',      color: 'orange' },
    { kode: 'PBM',   nama: 'Pemahaman Bacaan & Menulis',   color: 'teal'   },
    { kode: 'LBI',   nama: 'Literasi Bhs. Indonesia',      color: 'rose'   },
    { kode: 'LBIng', nama: 'Literasi Bhs. Inggris',        color: 'indigo' },
    { kode: 'PM',    nama: 'Penalaran Matematika',         color: 'amber'  },
];

const SUBTES_STYLE = {
    blue:   'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    teal:   'bg-teal-100 text-teal-800 border-teal-200',
    rose:   'bg-rose-100 text-rose-800 border-rose-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    amber:  'bg-amber-100 text-amber-800 border-amber-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
};

const ACTIVE_TAB_STYLE = {
    blue:   'bg-blue-600 border-blue-600 text-white',
    purple: 'bg-purple-600 border-purple-600 text-white',
    orange: 'bg-orange-500 border-orange-500 text-white',
    teal:   'bg-teal-600 border-teal-600 text-white',
    rose:   'bg-rose-600 border-rose-600 text-white',
    indigo: 'bg-indigo-600 border-indigo-600 text-white',
    amber:  'bg-amber-500 border-amber-500 text-white',
    slate:  'bg-slate-700 border-slate-700 text-white',
};

const subtesInfo = (kode) => SUBTES_LIST.find((s) => s.kode === kode);

function SubtesBadge({ kode, size = 'sm' }) {
    if (!kode) return <span className="text-[10px] text-slate-400 italic">–</span>;
    const info  = subtesInfo(kode);
    const color = info?.color || 'slate';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${SUBTES_STYLE[color]}`}>
            {kode}
        </span>
    );
}

export default function Show({ auth, paket, soals = [], bankSoals = [], filters }) {
    const { delete: destroy } = useForm();
    const isTryout = paket?.tipe === 'tryout';

    // ── State ─────────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery]           = useState(filters?.search || '');
    const [selectedKategori, setSelectedKategori] = useState(filters?.kategori || '');
    const [showBankModal, setShowBankModal]        = useState(false);
    const [bankSearch, setBankSearch]              = useState('');
    const [selectedIds, setSelectedIds]            = useState([]);
    const [submittingBank, setSubmittingBank]      = useState(false);
    // Tab aktif untuk tryout (null = "Semua")
    const [activeSubtes, setActiveSubtes]          = useState(isTryout ? 'PU' : null);
    // Subtes yang dipilih untuk modal bank soal / tambah soal baru
    const [bankSubtes, setBankSubtes]              = useState('PU');

    const categories = ['PU', 'PPU', 'PK', 'PBM', 'Literasi Bahasa Indonesia', 'Literasi Bahasa Inggris', 'Penalaran Matematika'];

    // ── Soal yang ditampilkan berdasarkan tab aktif ───────────────────────────
    const displaySoals = isTryout && activeSubtes
        ? soals.filter((s) => s.pivot?.subtes === activeSubtes)
        : soals.filter((s) => {
            const matchSearch   = !searchQuery   || s.konten_soal?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchKategori = !selectedKategori || s.kategori === selectedKategori;
            return matchSearch && matchKategori;
        });

    // ── Count soal per subtes ─────────────────────────────────────────────────
    const countBySubtes = (kode) => soals.filter((s) => s.pivot?.subtes === kode).length;
    const countUncategorized = soals.filter((s) => !s.pivot?.subtes).length;

    // ── Bank Soal filter ──────────────────────────────────────────────────────
    const filteredBank = bankSoals.filter((s) =>
        s.konten_soal?.toLowerCase().includes(bankSearch.toLowerCase()) ||
        s.kategori?.toLowerCase().includes(bankSearch.toLowerCase()) ||
        s.materi?.toLowerCase().includes(bankSearch.toLowerCase())
    );

    const toggleSelect = (id) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const toggleAll = () =>
        setSelectedIds(
            selectedIds.length === filteredBank.length
                ? []
                : filteredBank.map((s) => s.id_soal)
        );

    const handleAddFromBank = () => {
        if (selectedIds.length === 0) return;
        if (isTryout && !bankSubtes) {
            Swal.fire({ title: 'Pilih Subtes!', text: 'Pilih subtes untuk soal yang akan ditambahkan.', icon: 'warning', confirmButtonColor: '#1b5e20' });
            return;
        }
        setSubmittingBank(true);
        router.post(
            route('paket-latihan.add-soal', paket.id_paket),
            { soal_ids: selectedIds, subtes: isTryout ? bankSubtes : null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowBankModal(false);
                    setSelectedIds([]);
                    setBankSearch('');
                },
                onFinish: () => setSubmittingBank(false),
            }
        );
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Lepas Soal dari Paket?',
            text: 'Soal ini akan dilepas dari paket ini (tetap tersimpan di Bank Soal).',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, lepaskan!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-3xl p-6 shadow-xl', confirmButton: 'rounded-xl px-5 py-3 font-medium text-sm', cancelButton: 'rounded-xl px-5 py-3 font-medium text-sm' }
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('paket-latihan.remove-soal', { id_paket: paket.id_paket, id_soal: id }), {
                    onSuccess: () => Swal.fire({
                        title: 'Berhasil!', text: 'Soal berhasil dilepas dari paket ini.',
                        icon: 'success', confirmButtonColor: '#1b5e20',
                        customClass: { popup: 'rounded-3xl p-6 shadow-xl', confirmButton: 'rounded-xl px-5 py-3 font-medium text-sm' }
                    })
                });
            }
        });
    };

    const handleFilterChange = (kategori, search = searchQuery) => {
        setSelectedKategori(kategori);
        const params = {};
        if (kategori) params.kategori = kategori;
        if (search)   params.search   = search;
        router.get(route('paket-latihan.show', paket.id_paket), params, { preserveState: true });
    };

    const handleSearch = (e) => { e.preventDefault(); handleFilterChange(selectedKategori, searchQuery); };

    const diffBadge = (val) => {
        if (!val) return null;
        const map = { mudah: ['bg-emerald-50 text-emerald-700', 'Mudah'], sulit: ['bg-rose-50 text-rose-700', 'Sulit'] };
        const [cls, label] = map[val] || ['bg-amber-50 text-amber-700', 'Sedang'];
        return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${cls}`}>{label}</span>;
    };

    // ── Tambah Soal Baru: untuk tryout buka subtes-aware link ─────────────────
    const tambahSoalRoute = isTryout
        ? route('soal.create', { paket_id: paket.id_paket, subtes: activeSubtes || 'PU' })
        : route('soal.create', { paket_id: paket.id_paket });

    const openBankModal = () => {
        if (isTryout && activeSubtes) setBankSubtes(activeSubtes);
        setShowBankModal(true);
        setSelectedIds([]);
        setBankSearch('');
    };

    // ── Info Paket Try Out ────────────────────────────────────────────────────
    const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

    return (
        <AdminLayout user={auth.user} header={`Detail Paket: ${paket?.nama_paket}`}>
            <Head title={`Paket ${paket?.nama_paket}`} />

            {/* Back link */}
            <div className="mb-6">
                <Link href={route('paket-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm">
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Paket
                </Link>
            </div>

            {/* ===== 2-COLUMN LAYOUT ===== */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ---- KIRI: Info Paket ---- */}
                <div className="w-full lg:w-[300px] shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-4 space-y-5">

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                                isTryout ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                                {isTryout ? '🎯 Try Out' : '📚 Latihan Soal'}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                paket?.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                                {paket?.status === 'aktif' ? '✓ Aktif' : 'Nonaktif'}
                            </span>
                        </div>

                        {/* Nama & Deskripsi */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-snug">{paket?.nama_paket}</h2>
                            {paket?.deskripsi && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{paket.deskripsi}</p>}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Soal</p>
                                <p className="text-2xl font-bold text-slate-800">{soals.length}</p>
                            </div>
                            {isTryout ? (
                                <div className="bg-amber-50 rounded-xl p-3">
                                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Durasi</p>
                                    <p className="text-lg font-bold text-amber-800">265 mnt</p>
                                    <p className="text-[10px] text-amber-600">standar UTBK</p>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Waktu</p>
                                    <p className="text-2xl font-bold text-slate-800">{paket?.waktu_ujian > 0 ? paket.waktu_ujian : '∞'}</p>
                                    <p className="text-[10px] text-slate-400">{paket?.waktu_ujian > 0 ? 'menit' : 'tidak dibatasi'}</p>
                                </div>
                            )}
                        </div>

                        {/* Info khusus Try Out */}
                        {isTryout && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs space-y-2">
                                <p className="font-bold text-amber-800">📊 Konfigurasi Try Out</p>
                                {paket.tanggal_mulai && (
                                    <div className="flex items-start gap-1.5 text-amber-700">
                                        <Clock size={12} className="mt-0.5 shrink-0" />
                                        <div>
                                            <span className="font-semibold">Mulai:</span> {fmtDate(paket.tanggal_mulai)}<br/>
                                            <span className="font-semibold">Selesai:</span> {fmtDate(paket.tanggal_selesai)}
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3 text-amber-700">
                                    <span className={`flex items-center gap-1 ${paket.is_random ? 'text-amber-700' : 'text-amber-400 line-through'}`}>
                                        <Shuffle size={11}/> Random
                                    </span>
                                    <span className={`flex items-center gap-1 ${paket.bisa_pause ? 'text-amber-700' : 'text-amber-400 line-through'}`}>
                                        <PauseCircle size={11}/> Pause
                                    </span>
                                </div>
                                {/* Progress per subtes */}
                                <div className="pt-1 border-t border-amber-200 space-y-1">
                                    {SUBTES_LIST.map((s) => (
                                        <div key={s.kode} className="flex items-center justify-between">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${SUBTES_STYLE[s.color]}`}>{s.kode}</span>
                                            <span className="text-[10px] text-amber-700 font-semibold">{countBySubtes(s.kode)} soal</span>
                                        </div>
                                    ))}
                                    {countUncategorized > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500">–</span>
                                            <span className="text-[10px] text-slate-500 font-semibold">{countUncategorized} belum dikategorikan</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Edit Paket */}
                        <Link href={route('paket-latihan.edit', paket.id_paket)}
                            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm">
                            <Edit size={15} />
                            Edit Paket
                        </Link>
                    </div>
                </div>

                {/* ---- KANAN: Daftar Soal ---- */}
                <div className="flex-1 min-w-0">

                    {/* ══ TAB NAVIGASI SUBTES (hanya tryout) ══ */}
                    {isTryout && (
                        <div className="mb-4 overflow-x-auto">
                            <div className="flex items-center gap-1.5 min-w-max pb-1">
                                {/* Tab "Semua" */}
                                <button
                                    type="button"
                                    onClick={() => setActiveSubtes(null)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                        activeSubtes === null
                                            ? ACTIVE_TAB_STYLE['slate']
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Semua
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeSubtes === null ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                        {soals.length}
                                    </span>
                                </button>

                                {/* Tab per subtes */}
                                {SUBTES_LIST.map((s) => {
                                    const count   = countBySubtes(s.kode);
                                    const isActive = activeSubtes === s.kode;
                                    return (
                                        <button
                                            key={s.kode}
                                            type="button"
                                            onClick={() => setActiveSubtes(s.kode)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                                isActive ? ACTIVE_TAB_STYLE[s.color] : `bg-white border-slate-200 text-slate-600 hover:bg-slate-50`
                                            }`}
                                        >
                                            {s.kode}
                                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-white/25' : count > 0 ? `${SUBTES_STYLE[s.color]}` : 'bg-slate-100 text-slate-400'}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}

                                {/* Tab "Belum Dikategorikan" jika ada */}
                                {countUncategorized > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveSubtes('_uncategorized')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                            activeSubtes === '_uncategorized' ? ACTIVE_TAB_STYLE['slate'] : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        Belum Dikategorikan
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeSubtes === '_uncategorized' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                            {countUncategorized}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">
                                {isTryout && activeSubtes && activeSubtes !== '_uncategorized'
                                    ? `Soal — ${SUBTES_LIST.find(s => s.kode === activeSubtes)?.nama || activeSubtes}`
                                    : 'Daftar Soal'
                                }
                                <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {displaySoals.length}
                                </span>
                            </h3>
                            {isTryout && activeSubtes && activeSubtes !== '_uncategorized' && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {SUBTES_LIST.find(s => s.kode === activeSubtes)?.nama}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filter kategori hanya tampil kalau bukan tryout */}
                            {!isTryout && (
                                <>
                                    <select
                                        value={selectedKategori}
                                        onChange={(e) => handleFilterChange(e.target.value, searchQuery)}
                                        className="bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-sm font-medium focus:border-[#1b5e20] focus:ring-[#1b5e20] focus:ring-1 focus:outline-none transition-colors"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <form onSubmit={handleSearch} className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-colors">
                                        <Search size={15} className="text-slate-400 mr-2 shrink-0" />
                                        <input type="text" placeholder="Cari soal..." value={searchQuery}
                                            className="bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-600 w-36 placeholder-slate-400"
                                            onChange={(e) => setSearchQuery(e.target.value)} />
                                    </form>
                                </>
                            )}

                            {/* Tombol Tambah Soal (Baru) */}
                            <Link
                                href={tambahSoalRoute}
                                className={`inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm shrink-0 ${
                                    isTryout ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1b5e20] hover:bg-[#508953]'
                                }`}
                            >
                                <Plus size={15} />
                                {isTryout ? `Soal ${activeSubtes || 'Baru'}` : 'Tambah Soal'}
                            </Link>

                            {/* Tombol Dari Bank Soal */}
                            <button type="button" onClick={openBankModal}
                                className={`inline-flex items-center gap-1.5 border px-4 py-2 rounded-xl font-medium transition-colors text-sm shrink-0 ${
                                    isTryout
                                        ? 'border-amber-400 text-amber-700 hover:bg-amber-50'
                                        : 'border-[#1b5e20] text-[#1b5e20] hover:bg-[#e8f5e9]'
                                }`}
                            >
                                <BookOpen size={15} />
                                Dari Bank Soal
                            </button>
                        </div>
                    </div>

                    {/* Tabel Soal */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            {displaySoals.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="px-5 py-3.5">#</th>
                                            <th className="px-5 py-3.5">Soal</th>
                                            {isTryout && <th className="px-5 py-3.5">Subtes</th>}
                                            <th className="px-5 py-3.5">Tipe</th>
                                            <th className="px-5 py-3.5">Kunci</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displaySoals.map((soal, index) => (
                                            <tr key={soal.id_soal} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 max-w-xs">
                                                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                                        {soal.konten_soal?.replace(/<[^>]+>/g, '') || '(Soal tanpa teks)'}
                                                    </p>
                                                    {soal.materi && <span className="text-xs text-slate-400 mt-0.5 block">{soal.materi}</span>}
                                                    <div className="mt-1">{diffBadge(soal.tingkat_kesulitan)}</div>
                                                </td>
                                                {isTryout && (
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <SubtesBadge kode={soal.pivot?.subtes} />
                                                    </td>
                                                )}
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="text-sm text-slate-600 font-medium">
                                                        {soal.jenis_soal === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Isian'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm font-semibold text-slate-800">{soal.kunci_jawaban || '-'}</span>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                                        soal.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                    }`}>
                                                        {soal.status === 'aktif' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                        {soal.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <Link href={route('soal.edit', soal.id_soal)}
                                                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Edit Soal">
                                                            <Edit size={15} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(soal.id_soal)}
                                                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Lepas dari Paket">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-16 px-6">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isTryout ? 'bg-amber-50 text-amber-400' : 'bg-slate-100 text-slate-400'}`}>
                                        <Plus size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                                        {isTryout && activeSubtes && activeSubtes !== '_uncategorized'
                                            ? `Belum Ada Soal untuk ${activeSubtes}`
                                            : 'Belum Ada Soal'
                                        }
                                    </h4>
                                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                                        {isTryout
                                            ? `Tambahkan soal untuk subtes ${activeSubtes || ''}.`
                                            : 'Paket ini belum memiliki soal. Silakan tambahkan soal untuk memulai.'
                                        }
                                    </p>
                                    <Link href={tambahSoalRoute}
                                        className={`inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm ${
                                            isTryout ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1b5e20] hover:bg-[#508953]'
                                        }`}>
                                        <Plus size={18} />
                                        Tambah Soal {isTryout && activeSubtes ? activeSubtes : 'Pertama'}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>{/* end kolom kanan */}
            </div>{/* end 2-col layout */}

            {/* ===== MODAL BANK SOAL ===== */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBankModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">Ambil dari Bank Soal</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{bankSoals.length} soal tersedia · {selectedIds.length} dipilih</p>
                            </div>
                            <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-700 p-1"><X size={20} /></button>
                        </div>

                        {/* Pilih Subtes (hanya untuk tryout) */}
                        {isTryout && (
                            <div className="px-6 py-3 border-b border-slate-100 bg-amber-50/50">
                                <p className="text-xs font-semibold text-slate-600 mb-2">Masukkan soal ke subtes:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {SUBTES_LIST.map((s) => (
                                        <button key={s.kode} type="button" onClick={() => setBankSubtes(s.kode)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                bankSubtes === s.kode ? ACTIVE_TAB_STYLE[s.color] : `${SUBTES_STYLE[s.color]} hover:opacity-80`
                                            }`}
                                        >
                                            {s.kode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search + Pilih Semua */}
                        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3">
                            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-colors">
                                <Search size={15} className="text-slate-400 mr-2 shrink-0" />
                                <input type="text" placeholder="Cari soal..." autoFocus
                                    className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full outline-none text-slate-700 placeholder-slate-400"
                                    value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
                            </div>
                            {filteredBank.length > 0 && (
                                <button type="button" onClick={toggleAll}
                                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1b5e20] whitespace-nowrap transition-colors">
                                    <CheckSquare size={14} />
                                    {selectedIds.length === filteredBank.length ? 'Batal Semua' : 'Pilih Semua'}
                                </button>
                            )}
                        </div>

                        {/* List Soal */}
                        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
                            {filteredBank.length > 0 ? filteredBank.map((soal) => {
                                const isSelected = selectedIds.includes(soal.id_soal);
                                return (
                                    <label key={soal.id_soal}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            isSelected ? 'border-[#1b5e20] bg-[#f0faf0]' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(soal.id_soal)} className="mt-0.5 shrink-0 accent-[#1b5e20]" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 line-clamp-2 leading-snug">
                                                {soal.konten_soal?.replace(/<[^>]+>/g, '') || '(Soal tanpa teks)'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                {soal.kategori && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20]">{soal.kategori}</span>}
                                                <span className="text-[10px] text-slate-400 uppercase font-medium">
                                                    {soal.jenis_soal === 'pilihan_ganda' ? 'PG' : 'Isian'}
                                                </span>
                                                {diffBadge(soal.tingkat_kesulitan)}
                                            </div>
                                        </div>
                                    </label>
                                );
                            }) : (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    {bankSearch ? `Tidak ada soal yang cocok dengan "${bankSearch}".` : 'Semua soal sudah ada di paket ini.'}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div>
                                {isTryout && bankSubtes && (
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${SUBTES_STYLE[subtesInfo(bankSubtes)?.color || 'slate']}`}>
                                        Subtes: {bankSubtes}
                                    </span>
                                )}
                                {!isTryout && (
                                    <span className="text-xs text-slate-400">
                                        {selectedIds.length > 0 ? `${selectedIds.length} soal dipilih` : 'Belum ada soal yang dipilih'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setShowBankModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                    Batal
                                </button>
                                <button type="button" onClick={handleAddFromBank}
                                    disabled={selectedIds.length === 0 || submittingBank || (isTryout && !bankSubtes)}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 ${
                                        isTryout ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1b5e20] hover:bg-[#144718]'
                                    }`}
                                >
                                    <Plus size={14} />
                                    {submittingBank ? 'Menambahkan...' : `Tambahkan ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''} ke ${isTryout ? bankSubtes : 'Paket'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
