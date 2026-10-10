import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, XCircle, Search, BookOpen, X, CheckSquare, Clock, Shuffle, PauseCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ContainerWhite from '@/Components/ContainerWhite';
import Pagination from '@/Components/Pagination';
import PopupModal from '@/Components/PopupModal';

// ─── Konstanta Subtes UTBK ────────────────────────────────────────────────────
const SUBTES_LIST = [
    { kode: 'PU',    nama: 'Penalaran Umum'               },
    { kode: 'PPU',   nama: 'Penget. & Pemahaman Umum'     },
    { kode: 'PK',    nama: 'Pengetahuan Kuantitatif'      },
    { kode: 'PBM',   nama: 'Pemahaman Bacaan & Menulis'   },
    { kode: 'LBI',   nama: 'Literasi Bhs. Indonesia'      },
    { kode: 'LBIng', nama: 'Literasi Bhs. Inggris'        },
    { kode: 'PM',    nama: 'Penalaran Matematika'         },
];

const subtesInfo = (kode) => SUBTES_LIST.find((s) => s.kode?.toLowerCase() === kode?.toLowerCase());

function SubtesBadge({ kode }) {
    if (!kode) return <span className="text-[10px] text-slate-400 italic">–</span>;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fcc526] text-white uppercase tracking-wider shadow-2xs">
            {kode}
        </span>
    );
}

// ── Helper mapping subtes / kategori ke kode standar UTBK ─────────────────
function getSubtes(soal) {
    if (!soal) return null;
    if (soal.pivot?.subtes) {
        const p = String(soal.pivot.subtes).toUpperCase().trim();
        const found = SUBTES_LIST.find((s) => s.kode.toUpperCase() === p);
        if (found) return found.kode;
    }
    const val = String(soal.kategori || '').toLowerCase().trim();
    if (val === 'pu' || val.includes('penalaran umum')) return 'PU';
    if (val === 'ppu' || val.includes('pengetahuan & pemahaman') || val.includes('pengetahuan umum')) return 'PPU';
    if (val === 'pbm' || val.includes('pemahaman bacaan') || val.includes('bacaan & menulis') || val.includes('bacaan')) return 'PBM';
    if (val === 'pk' || val.includes('pengetahuan kuantitatif') || val.includes('kuantitatif')) return 'PK';
    if (val === 'lbi' || val.includes('literasi bahasa indonesia') || val.includes('bahasa indonesia')) return 'LBI';
    if (val === 'lbing' || val.includes('literasi bahasa inggris') || val.includes('bahasa inggris') || val.includes('english')) return 'LBIng';
    if (val === 'pm' || val.includes('penalaran matematika') || val.includes('matematika')) return 'PM';
    return null;
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
    const [bankFilterSubtes, setBankFilterSubtes]  = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [soalToRemove, setSoalToRemove] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [warningModalMessage, setWarningModalMessage] = useState('');
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

    const categories = ['PU', 'PPU', 'PK', 'PBM', 'LBI', 'LBing', 'PM'];

    // ── Soal yang ditampilkan berdasarkan pencarian & kategori ────────────────
    const displaySoals = useMemo(() => {
        return soals.filter((s) => {
            const matchSearch = !searchQuery || s.konten_soal?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchSearch) return false;

            if (!selectedKategori) return true;

            const sub = getSubtes(s);
            const kat = (s.kategori || '').toLowerCase();
            const piv = (s.pivot?.subtes || '').toLowerCase();
            const target = selectedKategori.toLowerCase();

            return (
                (sub && sub.toLowerCase() === target) ||
                kat === target ||
                kat.includes(target) ||
                piv === target
            );
        });
    }, [soals, searchQuery, selectedKategori]);

    // ── Pagination (10 soal per halaman) ──────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedKategori, searchQuery]);

    const totalItems = displaySoals.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedSoals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return displaySoals.slice(startIndex, startIndex + itemsPerPage);
    }, [displaySoals, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex   = Math.min(currentPage * itemsPerPage, totalItems);

    // ── Count soal per subtes ─────────────────────────────────────────────────
    const countBySubtes = (kode) => soals.filter((s) => getSubtes(s) === kode).length;
    const countUncategorized = soals.filter((s) => !getSubtes(s)).length;

    // ── Bank Soal filter ──────────────────────────────────────────────────────
    const filteredBank = useMemo(() => {
        return bankSoals.filter((s) => {
            const matchSearch = !bankSearch ||
                s.konten_soal?.toLowerCase().includes(bankSearch.toLowerCase()) ||
                s.kategori?.toLowerCase().includes(bankSearch.toLowerCase()) ||
                s.materi?.toLowerCase().includes(bankSearch.toLowerCase());

            if (!matchSearch) return false;

            if (isTryout && bankFilterSubtes) {
                const sub = getSubtes(s);
                const kat = (s.kategori || '').toLowerCase();
                const target = bankFilterSubtes.toLowerCase();
                return (sub && sub.toLowerCase() === target) || kat === target || kat.includes(target);
            }

            return true;
        });
    }, [bankSoals, bankSearch, bankFilterSubtes, isTryout]);

    const toggleSelect = (id) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const toggleAll = () => {
        const filteredIds = filteredBank.map((s) => s.id_soal);
        const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

        if (allFilteredSelected) {
            setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const handleAddFromBank = () => {
        if (selectedIds.length === 0) return;
        setSubmittingBank(true);
        router.post(
            route('paket-latihan.add-soal', paket.id_paket),
            { soal_ids: selectedIds, subtes: bankFilterSubtes || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowBankModal(false);
                    setSelectedIds([]);
                    setBankSearch('');
                    setSuccessMessage('Soal berhasil ditambahkan ke paket.');
                    setIsSuccessModalOpen(true);
                },
                onFinish: () => setSubmittingBank(false),
            }
        );
    };

    const handleDeleteClick = (soal) => {
        setSoalToRemove(soal);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!soalToRemove) return;
        destroy(route('paket-latihan.remove-soal', { id_paket: paket.id_paket, id_soal: soalToRemove.id_soal }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSoalToRemove(null);
                setSuccessMessage('Soal berhasil dilepas dari paket ini.');
                setIsSuccessModalOpen(true);
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
        const v = String(val).toLowerCase();
        const map = {
            mudah: ['bg-emerald-50 text-emerald-700 border-emerald-200/80', 'Mudah'],
            sulit: ['bg-rose-50 text-rose-700 border-rose-200/80', 'Sulit'],
        };
        const [cls, label] = map[v] || ['bg-amber-50 text-amber-700 border-amber-200/80', 'Sedang'];
        return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cls}`}>{label}</span>;
    };

    // ── Tambah Soal Baru: untuk tryout buka subtes-aware link jika kategori dipilih ─────
    const tambahSoalRoute = isTryout
        ? route('soal.create', { paket_id: paket.id_paket, ...(selectedKategori ? { subtes: getSubtes({ kategori: selectedKategori, pivot: { subtes: selectedKategori } }) || selectedKategori } : {}) })
        : route('soal.create', { paket_id: paket.id_paket });

    const openBankModal = () => {
        if (isTryout) {
            const shortKode = selectedKategori
                ? (getSubtes({ kategori: selectedKategori, pivot: { subtes: selectedKategori } }) || selectedKategori)
                : '';
            setBankFilterSubtes(shortKode);
        } else {
            setBankFilterSubtes('');
        }
        setShowBankModal(true);
        setSelectedIds([]);
        setBankSearch('');
    };

    // ── Info Paket Try Out ────────────────────────────────────────────────────
    // ── Info Paket Try Out ────────────────────────────────────────────────────
    const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    const durasiUjian = Number(paket?.waktu_ujian) > 0 ? Number(paket.waktu_ujian) : (isTryout ? 195 : 0);

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
                    <span>Detail Paket: {paket?.nama_paket}</span>
                </div>
            }
        >
            <Head title={`Paket ${paket?.nama_paket}`} />

            {/* ===== 2-COLUMN LAYOUT ===== */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ---- KIRI: Info Paket (Sticky / Fixed di layar saat scroll) ---- */}
                <div className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-24 lg:self-start">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

                        {/* Nama & Deskripsi */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-snug">{paket?.nama_paket}</h2>
                            {paket?.deskripsi && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{paket.deskripsi}</p>}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                            {/* Total Soal: Tanpa Container */}
                            <div className="flex flex-col justify-center py-1">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Soal</p>
                                <p className="text-3xl font-extrabold text-slate-800">{soals.length}</p>
                            </div>

                            {/* Durasi: Container Kuning #fffbeb Tanpa Border, Teks Durasi Hitam, Angka #f59e0b */}
                            <div className="bg-[#fffbeb] rounded-xl p-3 flex flex-col justify-center">
                                <p className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-1">
                                    {isTryout ? 'Durasi' : 'Waktu'}
                                </p>
                                <p className="text-xl font-extrabold text-[#f59e0b]">
                                    {durasiUjian > 0 ? `${durasiUjian} mnt` : '∞'}
                                </p>
                            </div>
                        </div>

                        {/* Info Konfigurasi & Rincian Subtes: Tanpa bg & border, nama subtes teks biasa warna gelap */}
                        <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5">
                            <p className="font-bold text-slate-900">
                                {isTryout ? 'Konfigurasi Try Out' : 'Rincian Subtes'}
                            </p>

                            {isTryout && (
                                <>
                                    {paket.tanggal_mulai && (
                                        <div className="flex items-start gap-1.5 text-slate-700">
                                            <Clock size={12} className="mt-0.5 shrink-0 text-slate-400" />
                                            <div>
                                                <span className="font-semibold text-slate-900">Mulai:</span> {fmtDate(paket.tanggal_mulai)}<br/>
                                                <span className="font-semibold text-slate-900">Selesai:</span> {fmtDate(paket.tanggal_selesai)}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 text-slate-700">
                                        <span className={`flex items-center gap-1 ${paket.is_random ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
                                            <Shuffle size={11} className={paket.is_random ? 'text-slate-600' : 'text-slate-400'}/> Random
                                        </span>
                                        <span className={`flex items-center gap-1 ${paket.bisa_pause ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
                                            <PauseCircle size={11} className={paket.bisa_pause ? 'text-slate-600' : 'text-slate-400'}/> Pause
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Breakdown per subtes: teks biasa warna gelap sama dengan isi teks */}
                            <div className={`${isTryout ? 'pt-2 border-t border-slate-100' : ''} space-y-1.5`}>
                                {SUBTES_LIST.map((s) => (
                                    <div key={s.kode} className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-700">
                                            {s.kode}
                                        </span>
                                        <span className="text-xs text-slate-900 font-semibold">{countBySubtes(s.kode)} soal</span>
                                    </div>
                                ))}
                                {countUncategorized > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-400">Lainnya</span>
                                        <span className="text-xs text-slate-500 font-semibold">{countUncategorized} belum dikategorikan</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Paket: PrimaryButton warna abu-abu */}
                        <Link href={route('paket-latihan.edit', paket.id_paket)} className="block w-full">
                            <PrimaryButton
                                type="button"
                                className="w-full justify-center gap-2 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !border-0 shadow-none !py-2.5 !rounded-xl font-medium text-sm transition-colors cursor-pointer"
                            >
                                <Edit size={15} />
                                Edit Paket
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>

                {/* ---- KANAN: Daftar Soal ---- */}
                <div className="flex-1 min-w-0">

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">
                                Daftar Soal
                                <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {displaySoals.length}
                                </span>
                            </h3>
                            {selectedKategori && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Filter: {selectedKategori}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filter kategori / subtes */}
                            <select
                                value={selectedKategori}
                                onChange={(e) => {
                                    setSelectedKategori(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-white border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-sm font-medium focus:border-[#1b5e20] focus:ring-[#1b5e20] focus:ring-1 focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>

                            {/* Search bar */}
                            <form onSubmit={(e) => e.preventDefault()} className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-colors">
                                <Search size={15} className="text-slate-400 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Cari soal..."
                                    value={searchQuery}
                                    className="bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-600 w-36 placeholder-slate-400 outline-none"
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </form>

                            {/* Tombol Tambah Soal (PrimaryButton) */}
                            <Link href={tambahSoalRoute}>
                                <PrimaryButton className="gap-1.5 !py-2.5 !px-4 text-sm font-semibold shadow-sm cursor-pointer">
                                    <Plus size={15} />
                                    Tambah Soal
                                </PrimaryButton>
                            </Link>

                            {/* Tombol Dari Bank Soal (SecondaryButton) */}
                            <SecondaryButton
                                type="button"
                                onClick={openBankModal}
                                className="gap-1.5 !py-2.5 !px-4 text-sm font-semibold !rounded-xl !bg-white hover:!bg-[#e8f5e9] !text-[#1b5e20] !border-[#1b5e20] shadow-sm cursor-pointer"
                            >
                                <BookOpen size={15} />
                                Dari Bank Soal
                            </SecondaryButton>
                        </div>
                    </div>

                    {/* Tabel Soal (ContainerWhite sama dengan modul admin lainnya) */}
                    <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
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
                                        {paginatedSoals.map((soal, index) => (
                                            <tr key={soal.id_soal} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                                                        {fromIndex + index}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 max-w-xs">
                                                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                                        {soal.konten_soal?.replace(/<[^>]+>/g, '') || '(Soal tanpa teks)'}
                                                    </p>
                                                    {soal.materi && <span className="text-xs text-slate-400 mt-0.5 block">{soal.materi}</span>}
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
                                                        <button onClick={() => handleDeleteClick(soal)}
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
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-emerald-50 text-[#1b5e20]">
                                        <Plus size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                                        Belum Ada Soal
                                    </h4>
                                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                                        {selectedKategori || searchQuery
                                            ? 'Tidak ada soal yang cocok dengan filter atau pencarian saat ini.'
                                            : 'Paket ini belum memiliki soal. Silakan tambahkan soal untuk memulai.'
                                        }
                                    </p>
                                    <Link href={tambahSoalRoute}>
                                        <PrimaryButton className="gap-2 !py-2.5 !px-5 text-sm font-semibold shadow-sm">
                                            <Plus size={18} />
                                            Tambah Soal
                                        </PrimaryButton>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Pagination (Batas 10 soal per halaman) */}
                        {totalItems > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                                from={fromIndex}
                                to={toIndex}
                                total={totalItems}
                                itemName="soal"
                            />
                        )}
                    </ContainerWhite>

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

                        {/* Filter Subtes (hanya untuk tryout) */}
                        {isTryout && (
                            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-700">Filter Berdasarkan Subtes:</p>
                                    {bankFilterSubtes && (
                                        <button
                                            type="button"
                                            onClick={() => setBankFilterSubtes('')}
                                            className="text-[11px] text-[#1b5e20] hover:underline font-semibold cursor-pointer"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setBankFilterSubtes('')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                            !bankFilterSubtes
                                                ? 'bg-[#1b5e20] border-[#1b5e20] text-white shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        Semua ({bankSoals.length})
                                    </button>
                                    {SUBTES_LIST.map((s) => {
                                        const countInSubtes = bankSoals.filter((b) => {
                                            const sub = getSubtes(b);
                                            const kat = (b.kategori || '').toLowerCase();
                                            return (sub && sub.toLowerCase() === s.kode.toLowerCase()) || kat === s.kode.toLowerCase();
                                        }).length;
                                        const isCurrent = bankFilterSubtes?.toUpperCase() === s.kode.toUpperCase();
                                        return (
                                            <button
                                                key={s.kode}
                                                type="button"
                                                onClick={() => setBankFilterSubtes(s.kode)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                    isCurrent
                                                        ? 'bg-[#fcc526] border-[#fcc526] text-white shadow-xs'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#fcc526]/50'
                                                }`}
                                            >
                                                <span>{s.kode}</span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isCurrent ? 'bg-black/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {countInSubtes}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Search + Pilih Semua */}
                        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3">
                            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-colors">
                                <Search size={15} className="text-slate-400 mr-2 shrink-0" />
                                <input type="text" placeholder="Cari isi soal, kategori, atau materi..." autoFocus
                                    className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full outline-none text-slate-700 placeholder-slate-400"
                                    value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
                            </div>
                            {filteredBank.length > 0 && (
                                <button type="button" onClick={toggleAll}
                                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1b5e20] whitespace-nowrap transition-colors cursor-pointer">
                                    <CheckSquare size={14} />
                                    {filteredBank.length > 0 && filteredBank.every((s) => selectedIds.includes(s.id_soal)) ? 'Batal Semua' : 'Pilih Semua'}
                                </button>
                            )}
                        </div>

                        {/* List Soal */}
                        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
                            {filteredBank.length > 0 ? filteredBank.map((soal) => {
                                const isSelected = selectedIds.includes(soal.id_soal);
                                const soalSubtes = getSubtes(soal);
                                return (
                                    <label key={soal.id_soal}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            isSelected ? 'border-[#1b5e20] bg-[#f0faf0]' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/80'
                                        }`}
                                    >
                                        {/* Kolom 1: Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(soal.id_soal)}
                                            className="w-4 h-4 rounded shrink-0 accent-[#1b5e20] cursor-pointer"
                                        />

                                        {/* Subtes Badge (untuk tryout atau jika punya subtes) */}
                                        {isTryout && (
                                            <div className="shrink-0">
                                                <SubtesBadge kode={soalSubtes || soal.kategori} />
                                            </div>
                                        )}

                                        {/* Kolom 2: Soal (Panjang) */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed" title={soal.konten_soal?.replace(/<[^>]+>/g, '')}>
                                                {soal.konten_soal?.replace(/<[^>]+>/g, '') || '(Soal tanpa teks)'}
                                            </p>
                                            {soal.materi && (
                                                <span className="text-[11px] text-slate-400 mt-0.5 inline-block truncate max-w-full">
                                                    Materi: {soal.materi}
                                                </span>
                                            )}
                                        </div>

                                        {/* Kolom 3: PG/Isian & Tingkat Kesulitan */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200/80">
                                                {soal.jenis_soal === 'pilihan_ganda' ? 'PG' : 'Isian'}
                                            </span>
                                            {diffBadge(soal.tingkat_kesulitan)}
                                        </div>
                                    </label>
                                );
                            }) : (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    {bankSearch || bankFilterSubtes
                                        ? 'Tidak ada soal yang cocok dengan filter yang dipilih.'
                                        : 'Semua soal sudah ada di paket ini.'}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div>
                                <span className="text-xs text-slate-500 font-medium">
                                    {selectedIds.length > 0 ? (
                                        <span className="text-[#1b5e20] font-semibold">
                                            {selectedIds.length} soal dipilih {isTryout ? '(otomatis masuk ke subtes masing-masing)' : ''}
                                        </span>
                                    ) : (
                                        'Belum ada soal yang dipilih'
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setShowBankModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                                    Batal
                                </button>
                                <button type="button" onClick={handleAddFromBank}
                                    disabled={selectedIds.length === 0 || submittingBank}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 bg-[#1b5e20] hover:bg-[#144718] shadow-sm cursor-pointer"
                                >
                                    <Plus size={14} />
                                    {submittingBank
                                        ? 'Menambahkan...'
                                        : `Tambahkan ${selectedIds.length > 0 ? `(${selectedIds.length}) Soal` : ''} ke Paket`
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* PopupModal Konfirmasi Lepas Soal dari Paket */}
            <PopupModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                maxWidth="sm"
                showCloseButton={true}
                padding="p-7 sm:p-8"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 text-red-500">
                        <Trash2 size={50} strokeWidth={2} />
                    </div>

                    <h3 className="font-['Poppins'] text-xl font-bold text-slate-800 tracking-tight mb-2">
                        Lepas Soal dari Paket?
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Soal ini akan dilepas dari paket latihan ini. Soal akan tetap tersimpan aman di Bank Soal.
                    </p>

                    <div className="flex items-center justify-center gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 py-2.5 px-5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="flex-1 py-2.5 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md active:scale-95 transition-all"
                        >
                            Ya, Lepaskan
                        </button>
                    </div>
                </div>
            </PopupModal>

            {/* PopupModal Peringatan */}
            <PopupModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                maxWidth="sm"
                showCloseButton={true}
                padding="p-7 sm:p-8"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertTriangle size={28} strokeWidth={2.2} />
                    </div>

                    <h3 className="font-['Poppins'] text-xl font-bold text-slate-800 tracking-tight mb-2">
                        Perhatian
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        {warningModalMessage}
                    </p>

                    <PrimaryButton
                        type="button"
                        onClick={() => setIsWarningModalOpen(false)}
                        className="w-full !py-2.5 !px-6 text-sm font-semibold shadow-md active:scale-95 transition-all"
                    >
                        Saya Mengerti
                    </PrimaryButton>
                </div>
            </PopupModal>

            {/* PopupModal Notifikasi Sukses */}
            <PopupModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                maxWidth="sm"
                showCloseButton={true}
                padding="p-7 sm:p-8"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 text-[#1b5e20]">
                        <CheckCircle2 size={50} strokeWidth={2.2} />
                    </div>

                    <h3 className="font-['Poppins'] text-xl font-bold text-slate-800 tracking-tight mb-2">
                        Berhasil!
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        {successMessage}
                    </p>

                    <PrimaryButton
                        type="button"
                        onClick={() => setIsSuccessModalOpen(false)}
                        className="w-full !py-3 !rounded-xl bg-[#1b5e20] hover:bg-[#144718] justify-center text-sm font-semibold shadow-md active:scale-95 transition-all"
                    >
                        Selesai
                    </PrimaryButton>
                </div>
            </PopupModal>
        </AdminLayout>
    );
}
