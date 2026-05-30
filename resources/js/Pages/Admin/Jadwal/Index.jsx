import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Pencil, Trash2, Calendar, Clock, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, jadwals, filters }) {
    const { delete: destroy } = useForm();
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

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
                destroy(route('jadwal.destroy', id), {
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

                    <Link
                        href={route('jadwal.create')}
                        className="w-full sm:w-auto shrink-0 justify-center bg-[#1b5e20] hover:bg-[#508953] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} />
                        Tambah Jadwal
                    </Link>
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
                                    <Link
                                        href={route('jadwal.edit', jadwal.id_jadwal)}
                                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(jadwal.id_jadwal)}
                                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
                        <Link
                            href={route('jadwal.create')}
                            className="bg-[#1b5e20] hover:bg-[#508953] text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Buat Jadwal Pertama
                        </Link>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
