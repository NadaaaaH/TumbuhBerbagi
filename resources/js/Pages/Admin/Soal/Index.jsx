import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit2, Trash2, Check, X, Filter, BookOpen, AlertCircle, Search } from 'lucide-react';

export default function Index({ auth, soals, pakets = [], filters }) {
    const [selectedKategori, setSelectedKategori] = useState(filters?.kategori || '');
    const [selectedPaket, setSelectedPaket] = useState(filters?.id_paket || '');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    
    // Available categories
    const categories = ['PPU', 'PK', 'PBM', 'Literasi Bahasa Indonesia', 'Literasi Bahasa Inggris', 'Penalaran Matematika'];

    const handleFilterChange = (kategori, id_paket, search = searchQuery) => {
        setSelectedKategori(kategori);
        setSelectedPaket(id_paket);
        
        const params = {};
        if (kategori) params.kategori = kategori;
        if (id_paket) params.id_paket = id_paket;
        if (search) params.search = search;
        
        router.get(route('soal.index'), params, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilterChange(selectedKategori, selectedPaket, searchQuery);
    };

    const toggleStatus = (id) => {
        router.patch(route('soal.toggleStatus', id), {}, { preserveScroll: true });
    };

    const deleteSoal = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
            router.delete(route('soal.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout user={auth.user} header="Bank Soal Latsol UTBK">
            <Head title="Bank Soal" />

            <div className="flex flex-col gap-4 mb-6">
                {/* Baris Atas: Kategori & Tombol Tambah */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full md:w-auto flex-1 scrollbar-hide">
                        <button
                            onClick={() => handleFilterChange('', selectedPaket, searchQuery)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                                selectedKategori === ''
                                    ? 'bg-[#1b5e20] text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleFilterChange(cat, selectedPaket, searchQuery)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                                    selectedKategori === cat
                                        ? 'bg-[#1b5e20] text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Add Button */}
                    <Link
                        href={route('soal.create')}
                        className="inline-flex items-center justify-center gap-2 bg-[#1b5e20] text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-[#144718] transition-colors shadow-sm shrink-0"
                    >
                        <Plus size={18} />
                        Tambah Soal Baru
                    </Link>
                </div>

                {/* Baris Bawah: Search & Filter Paket */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full sm:w-1/2 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#1b5e20] focus-within:ring-[#1b5e20] focus-within:ring-1 transition-colors">
                        <Search size={18} className="text-slate-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari soal..."
                            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-600 w-full placeholder-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Paket Filter Dropdown */}
                    <div className="w-full sm:w-1/2">
                        <select
                            value={selectedPaket}
                            onChange={(e) => handleFilterChange(selectedKategori, e.target.value, searchQuery)}
                            className="w-full bg-white border border-slate-200 text-slate-600 rounded-xl px-4 py-2 text-sm font-semibold focus:border-[#1b5e20] focus:ring-[#1b5e20] focus:ring-1 focus:outline-none transition-colors"
                        >
                            <option value="">Semua Paket Latihan</option>
                            {pakets.map((paket) => (
                                <option key={paket.id_paket} value={paket.id_paket}>
                                    {paket.nama_paket}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {soals && soals.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Soal & Paket</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Kunci Jawaban</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                                {soals.map((soal) => (
                                    <tr key={soal.id_soal} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 max-w-md">
                                            <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                                {soal.konten_soal}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                                <BookOpen size={12} />
                                                <span>{soal.paket_latihan?.nama_paket || 'Tanpa Paket'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                {soal.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600 uppercase">
                                                {soal.jenis_soal === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Isian'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {soal.kunci_jawaban}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleStatus(soal.id_soal)}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                    soal.status === 'aktif'
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                }`}
                                                title="Klik untuk mengubah status"
                                            >
                                                {soal.status === 'aktif' ? (
                                                    <>
                                                        <Check size={12} />
                                                        Aktif
                                                    </>
                                                ) : (
                                                    <>
                                                        <X size={12} />
                                                        Nonaktif
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <Link
                                                    href={route('soal.edit', soal.id_soal)}
                                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                    title="Edit Soal"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => deleteSoal(soal.id_soal)}
                                                    className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Hapus Soal"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-16 px-6">
                            <AlertCircle size={36} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">Tidak ada soal ditemukan</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Belum ada soal terdaftar di kategori ini atau silakan buat soal baru.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
