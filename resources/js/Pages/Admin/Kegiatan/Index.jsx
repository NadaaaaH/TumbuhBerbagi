import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, Calendar, Clock, Newspaper, Image as ImageIcon, Eye, CheckCircle2 } from 'lucide-react';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import SearchBar from '@/Components/SearchBar';
import PopupModal from '@/Components/PopupModal';
import KegiatanModal from '@/Pages/Welcome/Partials/KegiatanModal';
import { AnimatePresence } from 'framer-motion';

export default function Index({ auth, kegiatans, flash }) {
    const { delete: destroy } = useForm();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [kegiatanToDelete, setKegiatanToDelete] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setIsSuccessModalOpen(true);
        }
    }, [flash?.success]);

    // Strip HTML tags untuk preview deskripsi
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const allKegiatans = useMemo(() => {
        if (Array.isArray(kegiatans)) return kegiatans;
        if (kegiatans?.data && Array.isArray(kegiatans.data)) return kegiatans.data;
        return [];
    }, [kegiatans]);

    // Instant live search across multiple fields
    const filteredKegiatans = useMemo(() => {
        if (!allKegiatans || allKegiatans.length === 0) return [];
        if (!searchQuery.trim()) return allKegiatans;

        const query = searchQuery.toLowerCase().trim();
        return allKegiatans.filter((kegiatan) => {
            const nama = (kegiatan.nama_kegiatan || '').toLowerCase();
            const deskripsi = stripHtml(kegiatan.deskripsi).toLowerCase();
            const status = (kegiatan.status || '').toLowerCase();
            const tanggal = (kegiatan.tanggal || '').toLowerCase();
            return (
                nama.includes(query) ||
                deskripsi.includes(query) ||
                status.includes(query) ||
                tanggal.includes(query)
            );
        });
    }, [allKegiatans, searchQuery]);

    const totalItems = filteredKegiatans.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedKegiatans = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredKegiatans.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredKegiatans, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (kegiatan) => {
        setKegiatanToDelete(kegiatan);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!kegiatanToDelete) return;
        destroy(route('kegiatan.destroy', kegiatanToDelete.id_kegiatan), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setKegiatanToDelete(null);
                setSuccessMessage('Kegiatan berhasil dihapus.');
                setIsSuccessModalOpen(true);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Kegiatan">
            <Head title="Manajemen Kegiatan" />

            <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SearchBar
                        className="w-full sm:max-w-xs"
                        placeholder="Cari kegiatan..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />

                    <Link href={route('kegiatan.create')}>
                        <PrimaryButton className="gap-2 !py-2.5 !px-5 text-sm font-semibold shadow-sm hover:shadow-md">
                            <Plus size={18} />
                            Tambah Kegiatan
                        </PrimaryButton>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Kegiatan / Informasi</th>
                                <th className="px-6 py-4 font-medium">Tanggal</th>
                                <th className="px-6 py-4 font-medium">Waktu</th>
                                <th className="px-6 py-4 font-medium">Deskripsi</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedKegiatans && paginatedKegiatans.length > 0 ? (
                                paginatedKegiatans.map((kegiatan, index) => (
                                    <tr key={kegiatan.id_kegiatan} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">{fromIndex + index}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedKegiatan(kegiatan)}
                                                className="flex items-center gap-3 text-left group cursor-pointer"
                                                title="Klik untuk pratinjau tampilan kegiatan"
                                            >
                                                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                    {kegiatan.gambar_url || kegiatan.gambar ? (
                                                        <img
                                                            src={kegiatan.gambar_url || `/storage/${kegiatan.gambar}`}
                                                            alt={kegiatan.nama_kegiatan}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon size={18} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-900 group-hover:text-[#1b5e20] transition-colors line-clamp-1 max-w-xs">
                                                    {kegiatan.nama_kegiatan}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {kegiatan.tanggal
                                                ? new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric'
                                                  })
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {kegiatan.waktu_mulai
                                                ? `${kegiatan.waktu_mulai.slice(0, 5)}${
                                                      kegiatan.waktu_selesai ? ` - ${kegiatan.waktu_selesai.slice(0, 5)}` : ''
                                                  }`
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 max-w-xs">
                                            <p className="line-clamp-2 text-xs leading-relaxed">
                                                {stripHtml(kegiatan.deskripsi) || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    kegiatan.status === 'Aktif' || kegiatan.status === 'aktif'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {kegiatan.status || 'Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedKegiatan(kegiatan)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#144718] hover:bg-[#e8f5e9] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Pratinjau Kegiatan (Tampilan Siswa & Tamu)"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <Link
                                                    href={route('kegiatan.edit', kegiatan.id_kegiatan)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#144718] hover:bg-[#e8f5e9] rounded-xl transition-all duration-200"
                                                    title="Edit Kegiatan"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(kegiatan)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#c62828] hover:bg-[#ffebee] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Hapus Kegiatan"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                        {searchQuery.trim()
                                            ? `Tidak ada data kegiatan yang cocok dengan "${searchQuery}".`
                                            : 'Belum ada data kegiatan yang ditambahkan.'}
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
                    itemName="kegiatan"
                />
            </ContainerWhite>

            {/* Popup Modal Pratinjau Kegiatan (Sama seperti tampilan Siswa & Tamu) */}
            <AnimatePresence>
                {selectedKegiatan && (
                    <KegiatanModal
                        kegiatan={selectedKegiatan}
                        auth={auth}
                        onClose={() => setSelectedKegiatan(null)}
                    />
                )}
            </AnimatePresence>

            {/* PopupModal Konfirmasi Hapus Kegiatan */}
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
                        Hapus Kegiatan?
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Kegiatan ini akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
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
                        {successMessage || 'Data kegiatan berhasil diproses.'}
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
