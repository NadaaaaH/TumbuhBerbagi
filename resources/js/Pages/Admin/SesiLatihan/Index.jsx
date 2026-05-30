import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Search } from 'lucide-react';

export default function Index({ auth, pakets, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('sesi-latihan.index'), { search: searchQuery }, { preserveState: true });
    };
    return (
        <AdminLayout user={auth.user} header="Manajemen Sesi Latihan">
            <Head title="Sesi Latihan" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold">Paket Latihan</h2>
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
                </div>
                <div className="space-y-3">
                    {pakets.map((paket) => (
                        <div key={paket.id_paket} className="p-4 border rounded-xl flex items-center justify-between">
                            <div>
                                <div className="font-medium">{paket.nama_paket}</div>
                                <div className="text-sm text-slate-500">Soal aktif: {paket.soal_count}</div>
                            </div>
                            <Link href={route('sesi-latihan.show', paket.id_paket)} className="text-sm text-white bg-[#1b5e20] px-3 py-2 rounded-xl">Lihat Sesi</Link>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
