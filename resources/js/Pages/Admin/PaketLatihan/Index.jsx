import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import SearchBar from '@/Components/SearchBar';
import PopupModal from '@/Components/PopupModal';
import Pagination from '@/Components/Pagination';
import { Clock, Plus, CheckCircle2, Edit, Trash2, Calendar } from 'lucide-react';

export default function Index({ auth, pakets, flash, fixedTipe }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTipe, setSelectedTipe] = useState(fixedTipe || '');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paketToDelete, setPaketToDelete] = useState(null);

    const isTryoutOnly = fixedTipe === 'tryout';
    const isLatihanOnly = fixedTipe === 'latihan';

    const pageTitle = isTryoutOnly ? 'Paket Try Out' : (isLatihanOnly ? 'Paket Latihan' : 'Paket Latihan');
    const listTitle = isTryoutOnly ? 'Daftar Paket Try Out' : (isLatihanOnly ? 'Daftar Paket Latihan Soal' : 'Daftar Paket');
    const createRoute = isTryoutOnly ? route('paket-tryout.create') : route('paket-latihan.create');
    const createBtnLabel = isTryoutOnly ? 'Buat Paket Try Out' : 'Buat Paket';

    useEffect(() => {
        if (fixedTipe) {
            setSelectedTipe(fixedTipe);
        }
    }, [fixedTipe]);

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setIsSuccessModalOpen(true);
        }
    }, [flash?.success]);

    const allPakets = useMemo(() => {
        if (Array.isArray(pakets)) return pakets;
        if (pakets?.data && Array.isArray(pakets.data)) return pakets.data;
        return [];
    }, [pakets]);

    const filteredPakets = useMemo(() => {
        if (!allPakets || allPakets.length === 0) return [];
        return allPakets.filter((paket) => {
            const matchTipe = !selectedTipe || paket.tipe === selectedTipe;
            if (!matchTipe) return false;
            if (!searchQuery.trim()) return true;

            const query = searchQuery.toLowerCase().trim();
            const nama = (paket.nama_paket || '').toLowerCase();
            const deskripsi = (paket.deskripsi || '').toLowerCase();
            const status = (paket.status || '').toLowerCase();
            return nama.includes(query) || deskripsi.includes(query) || status.includes(query);
        });
    }, [allPakets, selectedTipe, searchQuery]);

    const totalItems = filteredPakets.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedPakets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPakets.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPakets, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (paket) => {
        setPaketToDelete(paket);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!paketToDelete) return;
        router.delete(route('paket-latihan.destroy', paketToDelete.id_paket), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSuccessMessage(`${paketToDelete.tipe === 'tryout' ? 'Paket Try Out' : 'Paket Latihan'} berhasil dihapus.`);
                setPaketToDelete(null);
                setIsSuccessModalOpen(true);
            },
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const colSpanCount = isTryoutOnly ? 7 : (!fixedTipe ? 7 : 6);

    return (
        <AdminLayout user={auth.user} header={pageTitle}>
            <Head title={pageTitle} />

            <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                {/* Header row filter & aksi */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                        <SearchBar
                            className="w-full sm:w-64"
                            placeholder={isTryoutOnly ? 'Cari paket try out...' : (isLatihanOnly ? 'Cari paket latihan...' : 'Cari paket...')}
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />

                        {/* Filter Tombol hanya jika tipe belum dipisahkan */}
                        {!fixedTipe && (
                            <div className="flex items-center gap-2">
                                {[
                                    { label: 'Semua', value: '' },
                                    { label: 'Try Out', value: 'tryout' },
                                    { label: 'Latihan Soal', value: 'latihan' }
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => {
                                            setSelectedTipe(tab.value);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                                            selectedTipe === tab.value
                                                ? 'bg-[#1b5e20] text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link href={createRoute} className="shrink-0 w-full sm:w-auto">
                        <PrimaryButton className="w-full sm:w-auto gap-2 !py-2.5 !px-5 text-sm font-semibold shadow-sm hover:shadow-md">
                            <Plus size={18} />
                            {createBtnLabel}
                        </PrimaryButton>
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Nama Paket</th>
                                {!fixedTipe && <th className="px-6 py-4 font-medium">Tipe</th>}
                                <th className="px-6 py-4 font-medium">Total Soal</th>
                                <th className="px-6 py-4 font-medium">Durasi</th>
                                {isTryoutOnly && <th className="px-6 py-4 font-medium">Jadwal Pelaksanaan</th>}
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedPakets && paginatedPakets.length > 0 ? (
                                paginatedPakets.map((paket, index) => (
                                    <tr key={paket.id_paket} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {fromIndex + index}
                                        </td>
                                        <td className="px-6 py-4 max-w-sm">
                                            <div className="font-semibold text-slate-900 line-clamp-1">
                                                {paket.nama_paket}
                                            </div>
                                            {paket.deskripsi && (
                                                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                    {paket.deskripsi}
                                                </div>
                                            )}
                                        </td>
                                        {!fixedTipe && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                                    paket.tipe === 'tryout'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                }`}>
                                                    {paket.tipe === 'tryout' ? 'Try Out' : 'Latihan'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                {paket.soal_count || 0} Soal
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                                                <Clock size={14} className="text-slate-400 shrink-0" />
                                                <span>
                                                    {paket.tipe === 'tryout'
                                                        ? (paket.waktu_ujian ? `${paket.waktu_ujian} Menit` : '195 Menit (UTBK)')
                                                        : (paket.waktu_ujian ? `${paket.waktu_ujian} Menit` : 'Fleksibel')}
                                                </span>
                                            </div>
                                        </td>
                                        {isTryoutOnly && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {paket.tanggal_mulai || paket.tanggal_aktif ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                        <Calendar size={14} className="text-amber-500 shrink-0" />
                                                        <span>
                                                            {paket.tanggal_mulai
                                                                ? `${formatDateTime(paket.tanggal_mulai)} ${paket.tanggal_selesai ? `- ${formatDateTime(paket.tanggal_selesai)}` : ''}`
                                                                : formatDateTime(paket.tanggal_aktif)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                paket.status === 'aktif'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {paket.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('paket-latihan.show', paket.id_paket)}
                                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144718] transition-colors shadow-xs"
                                                    title="Kelola Soal"
                                                >
                                                    Kelola Soal
                                                </Link>
                                                <Link
                                                    href={route('paket-latihan.edit', paket.id_paket)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#144718] hover:bg-[#e8f5e9] rounded-xl transition-all duration-200"
                                                    title="Edit Paket"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(paket)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#c62828] hover:bg-[#ffebee] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Hapus Paket"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={colSpanCount} className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery.trim()
                                            ? `Tidak ada data paket yang cocok dengan "${searchQuery}".`
                                            : isTryoutOnly
                                            ? 'Belum ada paket Try Out yang dibuat.'
                                            : isLatihanOnly
                                            ? 'Belum ada paket latihan yang dibuat.'
                                            : 'Belum ada data paket.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    from={fromIndex}
                    to={toIndex}
                    total={totalItems}
                    itemName={isTryoutOnly ? 'paket try out' : 'paket latihan'}
                />
            </ContainerWhite>

            {/* PopupModal Konfirmasi Hapus Paket */}
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
                        Hapus {paketToDelete?.tipe === 'tryout' ? 'Paket Try Out' : 'Paket Latihan'}?
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Apakah Anda yakin ingin menghapus paket &quot;{paketToDelete?.nama_paket}&quot;? Semua riwayat pengerjaan siswa pada paket ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 shadow-md transition-colors cursor-pointer"
                        >
                            Ya, Hapus
                        </button>
                    </div>
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
                        {successMessage || 'Data paket latihan berhasil diproses.'}
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
