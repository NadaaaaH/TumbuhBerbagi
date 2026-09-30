import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import SearchBar from '@/Components/SearchBar';
import Pagination from '@/Components/Pagination';
import { Eye, Users, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function Index({ auth, pakets }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTipe, setSelectedTipe] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const allPakets = useMemo(() => {
        if (Array.isArray(pakets)) return pakets;
        if (pakets?.data && Array.isArray(pakets.data)) return pakets.data;
        return [];
    }, [pakets]);

    const filteredPakets = useMemo(() => {
        if (!allPakets || allPakets.length === 0) return [];
        return allPakets.filter((paket) => {
            const matchTipe = !selectedTipe || paket.tipe === selectedTipe;
            if (!matchTipe) return false;
            if (!searchQuery.trim()) return true;

            const query = searchQuery.toLowerCase().trim();
            const nama = (paket.nama_paket || '').toLowerCase();
            const deskripsi = (paket.deskripsi || '').toLowerCase();
            return nama.includes(query) || deskripsi.includes(query);
        });
    }, [allPakets, selectedTipe, searchQuery]);

    const totalItems = filteredPakets.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedPakets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPakets.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPakets, currentPage, itemsPerPage]);

    const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <AdminLayout user={auth.user} header="Manajemen Sesi Latihan">
            <Head title="Hasil Latihan & Sesi" />

            <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                {/* Header row filter & pencarian */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <SearchBar
                            className="w-full sm:w-64"
                            placeholder="Cari paket..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />

                        {/* Filter Tipe */}
                        <div className="flex items-center gap-2">
                            {[
                                { label: 'Semua', value: '' },
                                { label: 'Try Out', value: 'tryout' },
                                { label: 'Latihan Soal', value: 'latihan' }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTipe(tab.value);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                                        selectedTipe === tab.value
                                            ? 'bg-[#1b5e20] text-white shadow-xs'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                        Total Paket: <span className="font-bold text-slate-800">{totalItems}</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">No</th>
                                <th className="px-6 py-4 font-medium">Nama Paket</th>
                                <th className="px-6 py-4 font-medium">Tipe</th>
                                <th className="px-6 py-4 font-medium">Total Soal</th>
                                <th className="px-6 py-4 font-medium">Total Pengerjaan</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedPakets && paginatedPakets.length > 0 ? (
                                paginatedPakets.map((paket, index) => (
                                    <tr key={paket.id_paket} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {fromIndex + index}
                                        </td>
                                        <td className="px-6 py-4 max-w-sm">
                                            <div className="font-semibold text-slate-900 line-clamp-1">
                                                {paket.nama_paket}
                                            </div>
                                            {paket.deskripsi && (
                                                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                    {paket.deskripsi}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                                paket.tipe === 'tryout'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            }`}>
                                                {paket.tipe === 'tryout' ? 'Try Out' : 'Latihan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                {paket.soal_count || 0} Soal Aktif
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                                <Users size={14} className="text-slate-400 shrink-0" />
                                                <span>{paket.sesi_latihan_count || 0} Sesi</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                paket.status === 'aktif'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {paket.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <Link
                                                href={route('sesi-latihan.show', paket.id_paket)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144718] transition-colors shadow-xs"
                                                title="Lihat Sesi & Hasil Pengerjaan"
                                            >
                                                <Eye size={15} />
                                                Lihat Sesi
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery.trim()
                                            ? `Tidak ada paket yang sesuai dengan pencarian "${searchQuery}".`
                                            : selectedTipe
                                            ? `Tidak ada data paket ${selectedTipe === 'tryout' ? 'Try Out' : 'Latihan'}.`
                                            : 'Belum ada data paket latihan.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    from={fromIndex}
                    to={toIndex}
                    total={totalItems}
                    itemName="paket latihan"
                />
            </ContainerWhite>
        </AdminLayout>
    );
}
