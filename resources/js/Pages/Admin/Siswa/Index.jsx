import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import PopupModal from '@/Components/PopupModal';
import SearchBar from '@/Components/SearchBar';

export default function Index({ auth, siswas, flash }) {
    const { delete: destroy } = useForm();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [siswaToDelete, setSiswaToDelete] = useState(null);

    const itemsPerPage = 10;

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setIsSuccessModalOpen(true);
        }
    }, [flash?.success]);

    const allSiswas = useMemo(() => {
        if (Array.isArray(siswas)) return siswas;
        if (siswas?.data && Array.isArray(siswas.data)) return siswas.data;
        return [];
    }, [siswas]);

    // Instant filter across multiple student attributes
    const filteredSiswas = useMemo(() => {
        if (!allSiswas || allSiswas.length === 0) return [];
        if (!searchQuery.trim()) return allSiswas;

        const query = searchQuery.toLowerCase().trim();
        return allSiswas.filter((siswa) => {
            const nama = (siswa.nama || '').toLowerCase();
            const email = (siswa.email || '').toLowerCase();
            const asalSekolah = (siswa.asal_sekolah || '').toLowerCase();
            const targetKampus = (siswa.target_kampus || '').toLowerCase();
            const batch = (siswa.batch || '').toString().toLowerCase();
            const noHp = (siswa.no_handphone || '').toLowerCase();
            const statusAkun = (siswa.status_akun || '').toLowerCase();

            return (
                nama.includes(query) ||
                email.includes(query) ||
                asalSekolah.includes(query) ||
                targetKampus.includes(query) ||
                batch.includes(query) ||
                noHp.includes(query) ||
                statusAkun.includes(query)
            );
        });
    }, [allSiswas, searchQuery]);

    const totalItems = filteredSiswas.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedSiswas = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSiswas.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSiswas, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (siswa) => {
        setSiswaToDelete(siswa);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!siswaToDelete) return;
        destroy(route('siswa.destroy', siswaToDelete.id_siswa), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSiswaToDelete(null);
                setSuccessMessage('Akun siswa berhasil dihapus.');
                setIsSuccessModalOpen(true);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Siswa">
            <Head title="Manajemen Siswa" />

            <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SearchBar
                        className="w-full sm:max-w-xs"
                        placeholder="Cari siswa..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />

                    <Link href={route('siswa.create')}>
                        <PrimaryButton className="gap-2 !py-2.5 !px-5 text-sm font-semibold shadow-sm hover:shadow-md">
                            <Plus size={18} />
                            Tambah Siswa
                        </PrimaryButton>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Nama Siswa</th>
                                <th className="px-6 py-4 font-medium">Asal Sekolah</th>
                                <th className="px-6 py-4 font-medium">Target Kampus</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">No. HP</th>
                                <th className="px-6 py-4 font-medium">Status Akun</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedSiswas && paginatedSiswas.length > 0 ? (
                                paginatedSiswas.map((siswa, index) => (
                                    <tr key={siswa.id_siswa} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">{fromIndex + index}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex items-center gap-3">
                                                {siswa.foto_profil_url ? (
                                                    <img src={siswa.foto_profil_url} alt={siswa.nama} className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-[#fcc526] text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {siswa.nama?.charAt(0) || 'S'}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span>{siswa.nama}</span>
                                                    {siswa.batch && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500">
                                                            {siswa.batch.toString().toLowerCase().includes('batch') ? siswa.batch : `Batch ${siswa.batch}`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{siswa.asal_sekolah || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{siswa.target_kampus || '-'}</td>
                                        <td className="px-6 py-4">{siswa.email}</td>
                                        <td className="px-6 py-4">{siswa.no_handphone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                siswa.status_akun === 'aktif' || siswa.status_akun === 'Aktif'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {siswa.status_akun}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('siswa.edit', siswa.id_siswa)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#144718] hover:bg-[#e8f5e9] rounded-xl transition-all duration-200"
                                                    title="Edit Siswa"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(siswa)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#c62828] hover:bg-[#ffebee] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Hapus Siswa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                        {searchQuery.trim()
                                            ? `Tidak ada data siswa yang cocok dengan "${searchQuery}".`
                                            : 'Belum ada data siswa yang ditambahkan.'}
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
                    itemName="siswa"
                />
            </ContainerWhite>

            {/* PopupModal Konfirmasi Hapus Siswa */}
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
                        Hapus Akun Siswa?
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Semua riwayat latihan, nilai, dan data siswa ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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
                        {successMessage || 'Data siswa berhasil disimpan ke sistem.'}
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
