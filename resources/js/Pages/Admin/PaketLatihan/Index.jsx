import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import { Search, Clock } from 'lucide-react';


export default function Index({ auth, pakets, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const activeTab = filters?.tipe || '';

    const applyFilters = ({ search = searchQuery, tipe = activeTab } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (tipe) params.tipe = tipe;
        router.get(route('paket-latihan.index'), params, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search: searchQuery });
    };

    const handleTabChange = (tipe) => {
        applyFilters({ tipe });
    };

    return (
        <AdminLayout user={auth.user} header="Paket Latihan">
            <Head title="Paket Latihan" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg font-semibold text-slate-800">Daftar Paket Latihan</h2>
                        {/* Filter Tombol */}
                        <div className="flex items-center gap-2">
                            {[{ label: 'Semua', value: '' }, { label: 'Try Out', value: 'tryout' }, { label: 'Latihan Soal', value: 'latihan' }].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.value
                                            ? 'bg-[#1b5e20] text-white'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <TextInput
                                type="text"
                                placeholder="Cari paket..."
                                className="w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border-slate-200 focus:!border-[#1b5e20] focus:!ring-[#1b5e20] text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        <Link
                            href={route('paket-latihan.create')}
                            className="w-full sm:w-auto text-sm text-white bg-[#1b5e20] hover:bg-[#144718] text-center px-4 py-2.5 rounded-xl transition-colors shrink-0 font-medium"
                        >
                            Buat Paket
                        </Link>
                    </div>
                </div>


                {/* List */}
                <div className="space-y-3">
                    {pakets && pakets.length > 0 ? (
                        pakets.map((paket) => (
                            <div
                                key={paket.id_paket}
                                className="p-5 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 hover:shadow-sm transition-all bg-white group"
                            >
                                <div>
                                    <div className="font-bold text-base text-slate-800 group-hover:text-[#1b5e20] transition-colors">
                                        {paket.nama_paket}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${paket.tipe === 'tryout'
                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            }`}>
                                            {paket.tipe === 'tryout' ? 'Try Out' : 'Latihan Soal'}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs text-slate-600 font-medium">
                                            Total Soal: {paket.soal_count || 0}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${paket.status === 'aktif'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {paket.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        {paket.tanggal_aktif && (
                                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                                <Clock size={11} />
                                                Aktif {new Date(paket.tanggal_aktif).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
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
                        <div className="text-sm text-slate-500 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            {activeTab
                                ? `Tidak ada paket ${activeTab === 'tryout' ? 'Try Out' : 'Latihan Soal'} yang ditemukan.`
                                : 'Belum ada paket latihan yang dibuat.'}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

