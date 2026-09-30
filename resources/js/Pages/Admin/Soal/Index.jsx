import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, BookOpen, CheckCircle2, AlertTriangle } from 'lucide-react';
import SearchBar from '@/Components/SearchBar';
import PrimaryButton from '@/Components/PrimaryButton';
import ContainerWhite from '@/Components/ContainerWhite';
import PopupModal from '@/Components/PopupModal';
import Pagination from '@/Components/Pagination';
import SelectInput from '@/Components/SelectInput';

export default function Index({ auth, soals, pakets = [], flash }) {
    const [selectedKategori, setSelectedKategori] = useState('');
    const [selectedPaket, setSelectedPaket] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [soalToDelete, setSoalToDelete] = useState(null);

    const itemsPerPage = 10;

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setIsSuccessModalOpen(true);
        }
        if (flash?.error) {
            setWarningMessage(flash.error);
            setIsWarningModalOpen(true);
        }
    }, [flash?.success, flash?.error]);

    const categories = ['PU', 'PPU', 'PK', 'PBM', 'Literasi Bahasa Indonesia', 'Literasi Bahasa Inggris', 'Penalaran Matematika'];

    const stripHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    };

    const allSoals = useMemo(() => {
        if (Array.isArray(soals)) return soals;
        if (soals?.data && Array.isArray(soals.data)) return soals.data;
        return [];
    }, [soals]);

    // Instant multi-key live search & filtering in memory
    const filteredSoals = useMemo(() => {
        if (!allSoals || allSoals.length === 0) return [];
        return allSoals.filter((soal) => {
            // Category / Subtes filter
            if (selectedKategori && soal.kategori !== selectedKategori) {
                return false;
            }

            // Paket filter
            if (selectedPaket) {
                const inPaket = Array.isArray(soal.paket_latihan) && soal.paket_latihan.some((pkt) => String(pkt.id_paket) === String(selectedPaket));
                if (!inPaket) return false;
            }

            // Search query filter across all keys
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const konten = stripHtml(soal.konten_soal).toLowerCase();
                const materi = (soal.materi || '').toLowerCase();
                const kategori = (soal.kategori || '').toLowerCase();
                const jenis = (soal.jenis_soal === 'pilihan_ganda' ? 'pilihan ganda pg' : (soal.jenis_soal || '')).toLowerCase();
                const kunci = (soal.kunci_jawaban || '').toLowerCase();
                const pembahasan = stripHtml(soal.pembahasan || '').toLowerCase();
                const kesulitan = (soal.tingkat_kesulitan || '').toLowerCase();
                const status = (soal.status || '').toLowerCase();

                const paketNames = Array.isArray(soal.paket_latihan)
                    ? soal.paket_latihan.map((p) => (p.nama_paket || '').toLowerCase()).join(' ')
                    : '';

                const pilihanJawaban = Array.isArray(soal.pilihan_jawaban)
                    ? soal.pilihan_jawaban.map((p) => `${p.kode_pilihan || ''} ${stripHtml(p.teks_pilihan || '')}`).join(' ').toLowerCase()
                    : '';

                const matchesQuery =
                    konten.includes(query) ||
                    materi.includes(query) ||
                    kategori.includes(query) ||
                    jenis.includes(query) ||
                    kunci.includes(query) ||
                    pembahasan.includes(query) ||
                    kesulitan.includes(query) ||
                    status.includes(query) ||
                    paketNames.includes(query) ||
                    pilihanJawaban.includes(query);

                if (!matchesQuery) return false;
            }

            return true;
        });
    }, [allSoals, selectedKategori, selectedPaket, searchQuery]);

    const totalItems = filteredSoals.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedSoals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSoals.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSoals, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (soal) => {
        // Cek jika soal masih terhubung ke paket latihan
        if (Array.isArray(soal.paket_latihan) && soal.paket_latihan.length > 0) {
            const paketNames = soal.paket_latihan.map((p) => p.nama_paket).join(', ');
            setWarningMessage(
                `Soal ini tidak dapat dihapus karena masih terhubung ke paket latihan (${paketNames}). Silakan ganti dengan soal lain di paket latihan tersebut atau lepaskan tautannya terlebih dahulu.`
            );
            setIsWarningModalOpen(true);
            return;
        }

        setSoalToDelete(soal);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!soalToDelete) return;

        router.delete(route('soal.destroy', soalToDelete.id_soal), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSoalToDelete(null);
                setSuccessMessage('Soal berhasil dihapus.');
                setIsSuccessModalOpen(true);
            },
            onError: (errors) => {
                setIsDeleteModalOpen(false);
                setSoalToDelete(null);
                if (errors?.error) {
                    setWarningMessage(errors.error);
                    setIsWarningModalOpen(true);
                }
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Bank Soal Latsol & TryOut">
            <Head title="Bank Soal" />

            <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                {/* Header row filter & aksi */}
                <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto flex-1 flex-wrap">
                        {/* Search Bar */}
                        <SearchBar
                            className="w-full sm:w-64"
                            placeholder="Cari soal, materi, kunci..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />

                        {/* Dropdown 1: Subtes / Kategori */}
                        <div className="w-full sm:w-52">
                            <SelectInput
                                value={selectedKategori}
                                onChange={(e) => {
                                    setSelectedKategori(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full text-sm font-medium cursor-pointer"
                            >
                                <option value="">Semua Subtes (Kategori)</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>

                        {/* Dropdown 2: Paket Latihan */}
                        <div className="w-full sm:w-52">
                            <SelectInput
                                value={selectedPaket}
                                onChange={(e) => {
                                    setSelectedPaket(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full text-sm font-medium cursor-pointer"
                            >
                                <option value="">Semua Paket Latihan</option>
                                {pakets.map((paket) => (
                                    <option key={paket.id_paket} value={paket.id_paket}>
                                        {paket.nama_paket}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                    </div>

                    {/* Add Button */}
                    <Link href={route('soal.create')} className="shrink-0 w-full sm:w-auto">
                        <PrimaryButton className="w-full sm:w-auto gap-2 !py-2.5 !px-5 text-sm font-semibold shadow-sm hover:shadow-md">
                            <Plus size={18} />
                            Tambah Soal Baru
                        </PrimaryButton>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Soal</th>
                                <th className="px-6 py-4 font-medium">Paket Latihan</th>
                                <th className="px-6 py-4 font-medium">Subtes</th>
                                <th className="px-6 py-4 font-medium">Tipe</th>
                                <th className="px-6 py-4 font-medium">Kunci Jawaban</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedSoals && paginatedSoals.length > 0 ? (
                                paginatedSoals.map((soal, index) => (
                                    <tr key={soal.id_soal} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{fromIndex + index}</td>

                                        {/* Kolom 1: Pratinjau Teks Soal */}
                                        <td className="px-6 py-4 max-w-sm">
                                            <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-relaxed">
                                                {stripHtml(soal.konten_soal)}
                                            </p>
                                            {soal.materi && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Materi: <span className="text-slate-600 font-medium">{soal.materi}</span>
                                                </p>
                                            )}
                                        </td>

                                        {/* Kolom 2: Paket Latihan */}
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {Array.isArray(soal.paket_latihan) && soal.paket_latihan.length > 0 ? (
                                                    <>
                                                        {soal.paket_latihan.slice(0, 2).map((pkt) => (
                                                            <span
                                                                key={pkt.id_paket}
                                                                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs font-medium"
                                                            >
                                                                <BookOpen size={11} className="text-slate-400 shrink-0" />
                                                                {pkt.nama_paket}
                                                            </span>
                                                        ))}
                                                        {soal.paket_latihan.length > 2 && (
                                                            <span className="text-xs text-slate-400 font-medium ml-0.5">
                                                                +{soal.paket_latihan.length - 2} lagi
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Belum ada paket</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Kolom 3: Subtes */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fcc526] text-white shadow-xs">
                                                {soal.kategori}
                                            </span>
                                            <div className="mt-1">
                                                {soal.tingkat_kesulitan_index !== null && soal.tingkat_kesulitan_index !== undefined ? (
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                                            soal.tingkat_kesulitan === 'mudah' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            soal.tingkat_kesulitan === 'sulit' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                        title={`Indeks Kesulitan: ${soal.tingkat_kesulitan_index}`}
                                                    >
                                                        {soal.tingkat_kesulitan === 'mudah' ? 'Mudah' : soal.tingkat_kesulitan === 'sulit' ? 'Sulit' : 'Sedang'} ({soal.tingkat_kesulitan_index})
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">
                                                        Belum diuji
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Kolom 4: Tipe */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600">
                                                {soal.jenis_soal === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Isian'}
                                            </span>
                                        </td>

                                        {/* Kolom 5: Kunci Jawaban */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {soal.kunci_jawaban}
                                            </span>
                                        </td>

                                        {/* Kolom 6: Aksi */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <Link
                                                    href={route('soal.edit', soal.id_soal)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#144718] hover:bg-[#e8f5e9] rounded-xl transition-all duration-200"
                                                    title="Edit Soal"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(soal)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#c62828] hover:bg-[#ffebee] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Hapus Soal"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery.trim() || selectedKategori || selectedPaket
                                            ? 'Tidak ada soal yang sesuai dengan filter atau kata kunci pencarian.'
                                            : 'Belum ada soal yang terdaftar.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    from={fromIndex}
                    to={toIndex}
                    total={totalItems}
                    itemName="soal"
                />
            </ContainerWhite>

            {/* PopupModal Konfirmasi Hapus Soal */}
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
                        Hapus Soal Latihan?
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Soal ini akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
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
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </PopupModal>

            {/* PopupModal Peringatan Soal Masih Terhubung ke Paket */}
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
                        Soal Tidak Bisa Dihapus
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        {warningMessage}
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
                        Berhasil Disimpan!
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        {successMessage || 'Data soal berhasil diproses.'}
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
