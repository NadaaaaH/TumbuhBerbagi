import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Pencil, Trash2, Calendar, Clock, Newspaper, Image as ImageIcon, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, kegiatans, filters }) {
    const { delete: destroy } = useForm();
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Kegiatan yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('kegiatan.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Kegiatan berhasil dihapus.', 'success');
                    }
                });
            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kegiatan.index'), { search: searchQuery }, { preserveState: true });
    };

    return (
        <AdminLayout
            user={auth.user}
            header="Manajemen Kegiatan"
        >
            <Head title="Manajemen Kegiatan" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 font-['Poppins']">Daftar Kegiatan</h2>
                    <p className="text-slate-500 text-sm">Kelola informasi dan kegiatan untuk siswa.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari kegiatan..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20] text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                    
                    <Link
                        href={route('kegiatan.create')}
                        className="w-full sm:w-auto shrink-0 justify-center bg-[#1b5e20] hover:bg-[#508953] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} />
                        Tambah Kegiatan
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kegiatans && kegiatans.length > 0 ? (
                    kegiatans.map((kegiatan) => (
                        <div key={kegiatan.id_kegiatan} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            {/* Image Placeholder */}
                            <div className="h-48 bg-slate-100 relative overflow-hidden group">
                                {kegiatan.gambar_url || kegiatan.gambar ? (
                                    <img 
                                        src={kegiatan.gambar_url || `/storage/${kegiatan.gambar}`} 
                                        alt={kegiatan.nama_kegiatan} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#1b5e20] shadow-sm flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${kegiatan.status === 'Aktif' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {kegiatan.status || 'Aktif'}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col space-y-3">
                                <h3 className="font-semibold text-lg text-slate-800 line-clamp-1">
                                    {kegiatan.nama_kegiatan}
                                </h3>
                                
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>{kegiatan.tanggal ? new Date(kegiatan.tanggal).toLocaleDateString('id-ID') : '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-slate-400" />
                                        <span>{kegiatan.waktu_mulai ? `${kegiatan.waktu_mulai} - ${kegiatan.waktu_selesai}` : '-'}</span>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm line-clamp-2 mt-2">
                                    {kegiatan.deskripsi}
                                </p>

                                <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100">
                                    <Link
                                        href={route('kegiatan.edit', kegiatan.id_kegiatan)}
                                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Pencil size={16} /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(kegiatan.id_kegiatan)}
                                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                            <Newspaper size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Kegiatan</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Anda belum menambahkan informasi atau kegiatan apa pun untuk siswa.
                        </p>
                        <Link
                            href={route('kegiatan.create')}
                            className="bg-[#1b5e20] hover:bg-[#508953] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Tambah Kegiatan Pertama
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
