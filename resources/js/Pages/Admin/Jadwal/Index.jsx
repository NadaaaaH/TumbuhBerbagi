import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SearchBar from '@/Components/SearchBar';
import PrimaryButton from '@/Components/PrimaryButton';
import ContainerWhite from '@/Components/ContainerWhite';
import Pagination from '@/Components/Pagination';
import { Plus, Edit, Pencil, Trash2, Calendar, Clock, X, ImagePlus, Save, CheckCircle2 } from 'lucide-react';
import PopupModal from '@/Components/PopupModal';

export default function Index({ auth, jadwals, flash }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jadwalToDelete, setJadwalToDelete] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setIsSuccessModalOpen(true);
        }
    }, [flash?.success]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'post',
        nama_jadwal: '',
        deskripsi: '',
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        status: 'aktif',
        gambar: null,
        remove_gambar: false,
    });

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        setData({
            _method: 'post',
            nama_jadwal: '',
            deskripsi: '',
            tanggal: '',
            waktu_mulai: '',
            waktu_selesai: '',
            status: 'aktif',
            gambar: null,
            remove_gambar: false,
        });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (jadwal) => {
        setModalMode('edit');
        setEditingId(jadwal.id_jadwal);
        setData({
            _method: 'put',
            nama_jadwal: jadwal.nama_jadwal || '',
            deskripsi: jadwal.deskripsi || '',
            tanggal: jadwal.tanggal ? String(jadwal.tanggal).slice(0, 10) : '',
            waktu_mulai: jadwal.waktu_mulai ? String(jadwal.waktu_mulai).slice(0, 5) : '',
            waktu_selesai: jadwal.waktu_selesai ? String(jadwal.waktu_selesai).slice(0, 5) : '',
            status: jadwal.status || 'aktif',
            gambar: null,
            remove_gambar: false,
        });
        setImagePreview(jadwal.gambar_url || (jadwal.gambar ? `/storage/${jadwal.gambar}` : null));
        if (fileInputRef.current) fileInputRef.current.value = '';
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        clearErrors();
        reset();
        setImagePreview(null);
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                gambar: file,
                remove_gambar: false,
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData((prev) => ({
            ...prev,
            gambar: null,
            remove_gambar: true,
        }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('jadwal.store'), {
                forceFormData: true,
                onSuccess: () => {
                    closeModal();
                    setSuccessMessage('Jadwal berhasil ditambahkan!');
                    setIsSuccessModalOpen(true);
                }
            });
        } else {
            post(route('jadwal.update', editingId), {
                forceFormData: true,
                onSuccess: () => {
                    closeModal();
                    setSuccessMessage('Jadwal berhasil diperbarui!');
                    setIsSuccessModalOpen(true);
                }
            });
        }
    };

    const handleDeleteClick = (jadwal) => {
        setJadwalToDelete(jadwal);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!jadwalToDelete) return;
        router.delete(route('jadwal.destroy', jadwalToDelete.id_jadwal), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setJadwalToDelete(null);
                setSuccessMessage('Jadwal berhasil dihapus.');
                setIsSuccessModalOpen(true);
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('jadwal.index'), { search: searchQuery }, { preserveState: true });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return time.slice(0, 5);
    };

    const isExpired = (jadwal) => {
        if (!jadwal.tanggal || !jadwal.waktu_selesai) return false;
        const endDateTime = new Date(`${jadwal.tanggal} ${jadwal.waktu_selesai}`);
        return new Date() > endDateTime;
    };

    const getStatusBadge = (jadwal) => {
        if (jadwal.status === 'nonaktif') {
            return 'bg-red-50 text-red-600 border border-red-200';
        }
        if (isExpired(jadwal)) {
            return 'bg-slate-50 text-slate-600 border border-slate-200';
        }
        return 'bg-green-50 text-green-600 border border-green-200';
    };

    const getStatusText = (jadwal) => {
        if (jadwal.status === 'nonaktif') {
            return 'Nonaktif';
        }
        if (isExpired(jadwal)) {
            return 'Selesai';
        }
        return 'Aktif';
    };

    const allJadwals = useMemo(() => {
        if (Array.isArray(jadwals)) return jadwals;
        if (jadwals?.data && Array.isArray(jadwals.data)) return jadwals.data;
        return [];
    }, [jadwals]);

    const filteredJadwals = useMemo(() => {
        if (!allJadwals || allJadwals.length === 0) return [];
        if (!searchQuery.trim()) return allJadwals;

        const query = searchQuery.toLowerCase().trim();
        return allJadwals.filter((j) => {
            const nama = (j.nama_jadwal || '').toLowerCase();
            const deskripsi = (j.deskripsi || '').toLowerCase();
            const tanggal = (j.tanggal || '').toLowerCase();
            const status = (j.status || '').toLowerCase();
            return nama.includes(query) || deskripsi.includes(query) || tanggal.includes(query) || status.includes(query);
        });
    }, [allJadwals, searchQuery]);

    const totalItems = filteredJadwals.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedJadwals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredJadwals.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredJadwals, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <AdminLayout
            user={auth.user}
            header="Manajemen Jadwal"
        >
            <Head title="Manajemen Jadwal" />

            <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SearchBar
                        className="w-full sm:max-w-xs"
                        placeholder="Cari jadwal..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />

                    <PrimaryButton
                        type="button"
                        onClick={openCreateModal}
                        className="gap-2 !py-2.5 !px-5 text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                        <Plus size={18} />
                        Tambah Jadwal
                    </PrimaryButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Nama Jadwal / Kegiatan</th>
                                <th className="px-6 py-4 font-medium">Tanggal</th>
                                <th className="px-6 py-4 font-medium">Waktu</th>
                                <th className="px-6 py-4 font-medium">Deskripsi</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedJadwals && paginatedJadwals.length > 0 ? (
                                paginatedJadwals.map((jadwal, index) => (
                                    <tr key={jadwal.id_jadwal} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">{fromIndex + index}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                                                    {jadwal.gambar_url || jadwal.gambar ? (
                                                        <img
                                                            src={jadwal.gambar_url || `/storage/${jadwal.gambar}`}
                                                            alt={jadwal.nama_jadwal}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Calendar size={18} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                                                    {jadwal.nama_jadwal}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {formatDate(jadwal.tanggal)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 max-w-xs">
                                            <p className="line-clamp-2 text-xs leading-relaxed">
                                                {jadwal.deskripsi || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(jadwal)}`}>
                                                {getStatusText(jadwal)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(jadwal)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#144718] hover:bg-[#e8f5e9] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Edit Jadwal"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(jadwal)}
                                                    className="p-2 text-[#1b5e20] hover:text-[#c62828] hover:bg-[#ffebee] rounded-xl transition-all duration-200 cursor-pointer"
                                                    title="Hapus Jadwal"
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
                                            ? `Tidak ada data jadwal yang cocok dengan "${searchQuery}".`
                                            : 'Belum ada data jadwal yang ditambahkan.'}
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
                    itemName="jadwal"
                />
            </ContainerWhite>

            {/* Popup Modal Tambah / Edit Jadwal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop Click Outside to Close */}
                    <div
                        className="fixed inset-0"
                        onClick={closeModal}
                    />

                    {/* Modal Content Panel */}
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[92vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {modalMode === 'create' ? 'Tambah Jadwal Baru' : 'Edit Jadwal'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {modalMode === 'create' ? 'Isi formulir berikut untuk menambahkan jadwal mentoring atau kegiatan siswa.' : 'Perbarui detail informasi jadwal mentoring atau kegiatan.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-full transition-colors cursor-pointer"
                                aria-label="Tutup modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Scrollable Form Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="form-jadwal-modal" onSubmit={handleFormSubmit} className="space-y-5">

                                {/* Nama Jadwal */}
                                <div>
                                    <InputLabel htmlFor="modal_nama_jadwal" value="Nama Jadwal / Kegiatan" />
                                    <TextInput
                                        id="modal_nama_jadwal"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.nama_jadwal}
                                        onChange={(e) => setData('nama_jadwal', e.target.value)}
                                        required
                                        placeholder="Contoh: Sesi Mentoring Batch 1, Kelas Online Matematika"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nama_jadwal} className="mt-2" />
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <InputLabel htmlFor="modal_deskripsi" value="Deskripsi (Opsional)" />
                                    <textarea
                                        id="modal_deskripsi"
                                        className="mt-1 block w-full border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-xl shadow-sm text-sm px-4 py-2.5 resize-none"
                                        rows={3}
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        placeholder="Deskripsi singkat tentang jadwal ini..."
                                        disabled={processing}
                                    />
                                    <InputError message={errors.deskripsi} className="mt-2" />
                                </div>

                                {/* Tanggal & Status Grid */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <InputLabel htmlFor="modal_tanggal" value="Tanggal Jadwal" />
                                        <TextInput
                                            id="modal_tanggal"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.tanggal}
                                            onChange={(e) => setData('tanggal', e.target.value)}
                                            required
                                            disabled={processing}
                                        />
                                        <InputError message={errors.tanggal} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel value="Status" />
                                        <div className="mt-2 flex items-center gap-4">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={data.status === 'aktif' || data.status === 'Aktif'}
                                                onClick={() => setData('status', (data.status === 'aktif' || data.status === 'Aktif') ? 'nonaktif' : 'aktif')}
                                                disabled={processing}
                                                className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${(data.status === 'aktif' || data.status === 'Aktif')
                                                        ? 'bg-[#1b5e20] border-[#1b5e20]'
                                                        : 'bg-slate-200 border-slate-200'
                                                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span
                                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${(data.status === 'aktif' || data.status === 'Aktif')
                                                            ? 'translate-x-[40px]'
                                                            : 'translate-x-0.5'
                                                        }`}
                                                />
                                            </button>
                                            <span className={`text-sm font-semibold transition-colors duration-200 ${(data.status === 'aktif' || data.status === 'Aktif')
                                                    ? 'text-[#1b5e20]'
                                                    : 'text-slate-400'
                                                }`}>
                                                {(data.status === 'aktif' || data.status === 'Aktif') ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>

                                {/* Upload Gambar Banner */}
                                <div>
                                    <InputLabel htmlFor="modal_gambar" value="Gambar Banner (Opsional)" />
                                    <p className="text-xs text-slate-400 mt-0.5 mb-2">Gambar akan ditampilkan sebagai banner card jadwal di halaman siswa. Rasio 16:9 disarankan.</p>

                                    {imagePreview ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview banner"
                                                className="w-full h-40 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full p-1.5 shadow transition-all cursor-pointer"
                                                title="Hapus gambar"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="absolute bottom-2 left-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    Ganti Gambar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="modal_gambar"
                                            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#1b5e20] hover:bg-green-50/40 transition-all"
                                        >
                                            <ImagePlus size={28} className="text-slate-300 mb-2" />
                                            <span className="text-xs text-slate-500 font-medium">Klik untuk upload gambar banner</span>
                                            <span className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP — maks. 2MB</span>
                                        </label>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        id="modal_gambar"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.gambar} className="mt-2" />
                                </div>

                                {/* Waktu Mulai & Waktu Selesai Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="modal_waktu_mulai" value="Waktu Mulai" />
                                        <TextInput
                                            id="modal_waktu_mulai"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={data.waktu_mulai}
                                            onChange={(e) => setData('waktu_mulai', e.target.value)}
                                            required
                                            disabled={processing}
                                        />
                                        <InputError message={errors.waktu_mulai} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="modal_waktu_selesai" value="Waktu Selesai" />
                                        <TextInput
                                            id="modal_waktu_selesai"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={data.waktu_selesai}
                                            onChange={(e) => setData('waktu_selesai', e.target.value)}
                                            placeholder="Otomatis 1 jam setelah mulai"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.waktu_selesai} className="mt-2" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Waktu selesai bersifat opsional — otomatis diisi 1 jam setelah waktu mulai jika dibiarkan kosong.</p>
                            </form>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={processing}
                                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <PrimaryButton
                                form="form-jadwal-modal"
                                type="submit"
                                disabled={processing}
                                className="gap-2 !py-2.5 !px-6 text-sm font-semibold shadow-sm hover:shadow-md cursor-pointer"
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan...' : (modalMode === 'create' ? 'Simpan Jadwal' : 'Perbarui Jadwal')}
                            </PrimaryButton>
                        </div>

                    </div>
                </div>
            )}

            {/* PopupModal Konfirmasi Hapus Jadwal */}
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
                        Hapus Jadwal?
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Jadwal kegiatan atau mentoring ini akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
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
                        {successMessage || 'Data jadwal berhasil diproses.'}
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
