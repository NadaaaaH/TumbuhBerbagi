import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, Search, MoreVertical } from 'lucide-react';

export default function Index({ auth, siswas, filters }) {
    const { delete: destroy } = useForm();
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            destroy(route('siswa.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('siswa.index'), { search: searchQuery }, { preserveState: true });
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Siswa">
            <Head title="Manajemen Siswa" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari siswa..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20] text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                    
                    <Link
                        href={route('siswa.create')}
                        className="inline-flex items-center gap-2 bg-[#1b5e20] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#144718] transition-colors shadow-sm hover:shadow"
                    >
                        <Plus size={20} />
                        Tambah Siswa
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Nama Siswa</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">No. HP</th>
                                <th className="px-6 py-4 font-medium">Status Akun</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siswas && siswas.length > 0 ? (
                                siswas.map((siswa, index) => (
                                    <tr key={siswa.id_siswa} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{siswa.nama}</td>
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
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Siswa"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(siswa.id_siswa)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        Belum ada data siswa yang ditambahkan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <div>Menampilkan {siswas?.length || 0} siswa</div>
                </div>
            </div>
        </AdminLayout>
    );
}
