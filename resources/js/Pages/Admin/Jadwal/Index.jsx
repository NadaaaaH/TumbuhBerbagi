import React, { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Plus, Pencil, Trash2, Calendar, Clock, Search, X, ImagePlus, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, jadwals, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

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
        setImagePreview(jadwal.gambar ? `/storage/${jadwal.gambar}` : null);
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
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: 'Jadwal berhasil ditambahkan!',
                        confirmButtonColor: '#1b5e20'
                    });
                }
            });
        } else {
            post(route('jadwal.update', editingId), {
                forceFormData: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: 'Jadwal berhasil diperbarui!',
                        confirmButtonColor: '#1b5e20'
                    });
                }
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Jadwal yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('jadwal.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Jadwal berhasil dihapus.', 'success');
                    }
                });
            }
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

    return (
        <AdminLayout
            user={auth.user}
            header="Manajemen Jadwal"
        >
            <Head title="Manajemen Jadwal" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 font-['Poppins']">Daftar Jadwal</h2>
                    <p className="text-slate-500 text-sm">Kelola jadwal mentoring dan kegiatan untuk siswa.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari jadwal..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20] text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="w-full sm:w-auto shrink-0 justify-center bg-[#1b5e20] hover:bg-[#508953] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                        <Plus size={18} />
                        Tambah Jadwal
                    </button>
                </div>
            </div>

            {jadwals && jadwals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jadwals.map((jadwal) => (
                        <div key={jadwal.id_jadwal} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-lg text-slate-800 flex-1 line-clamp-2">
                                        {jadwal.nama_jadwal}
                                    </h3>
                                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(jadwal)}`}>
                                        {getStatusText(jadwal)}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-slate-400 flex-shrink-0" />
                                        <span>{formatDate(jadwal.tanggal)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-slate-400 flex-shrink-0" />
                                        <span>{formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(jadwal)}
                                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(jadwal.id_jadwal)}
                                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Calendar size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Belum ada jadwal</h3>
                        <p className="text-slate-500 mb-6">Mulai dengan membuat jadwal baru untuk siswa Anda.</p>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-[#1b5e20] hover:bg-[#508953] text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={18} />
                            Buat Jadwal Pertama
                        </button>
                    </div>
                </div>
            )}

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
                                                className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${
                                                    (data.status === 'aktif' || data.status === 'Aktif')
                                                        ? 'bg-[#1b5e20] border-[#1b5e20]'
                                                        : 'bg-slate-200 border-slate-200'
                                                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span
                                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                                                        (data.status === 'aktif' || data.status === 'Aktif')
                                                            ? 'translate-x-[40px]'
                                                            : 'translate-x-0.5'
                                                    }`}
                                                />
                                            </button>
                                            <span className={`text-sm font-semibold transition-colors duration-200 ${
                                                (data.status === 'aktif' || data.status === 'Aktif')
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
                                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                form="form-jadwal-modal"
                                type="submit"
                                disabled={processing}
                                className="bg-[#1b5e20] hover:bg-[#508953] disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan...' : (modalMode === 'create' ? 'Simpan Jadwal' : 'Perbarui Jadwal')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
