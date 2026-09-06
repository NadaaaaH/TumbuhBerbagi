import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Search } from 'lucide-react';

export default function Index({ auth, pakets, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('paket-latihan.index'), { search: searchQuery }, { preserveState: true });
    };
    return (
        <AdminLayout user={auth.user} header="Paket Latihan">
            <Head title="Paket Latihan" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold">Daftar Paket Latihan</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari paket..." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20] text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        <Link href={route('paket-latihan.create')} className="w-full sm:w-auto text-sm text-white bg-[#1b5e20] hover:bg-[#144718] text-center px-4 py-2.5 rounded-xl transition-colors shrink-0">Buat Paket</Link>
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    {pakets && pakets.length > 0 ? (
                        pakets.map((paket) => (
                            <div key={paket.id_paket} className="p-5 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 hover:shadow-sm transition-all bg-white">
                                <div>
                                    <div className="font-bold text-lg text-slate-800">{paket.nama_paket}</div>
                                    <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                                            paket.tipe === 'tryout' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}>
                                            {paket.tipe === 'tryout' ? 'Try Out' : 'Latihan Soal'}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs text-slate-600 font-medium">
                                            Total Soal: {paket.soal_count || 0}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                            paket.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {paket.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link 
                                        href={route('paket-latihan.show', paket.id_paket)} 
                                        className="text-sm text-white bg-[#1b5e20] hover:bg-[#144718] px-4 py-2.5 rounded-xl font-medium transition-colors"
                                    >
                                        Kelola Soal
                                    </Link>
                                    <Link 
                                        href={route('paket-latihan.edit', paket.id_paket)} 
                                        className="text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 rounded-xl font-medium transition-colors"
                                    >
                                        Edit Paket
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            Belum ada paket latihan yang dibuat.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
