import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';

export default function Show({ auth, paket, soals = [], filters }) {
    const { delete: destroy } = useForm();
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
            destroy(route('soal.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('paket-latihan.show', paket.id_paket), { search: searchQuery }, { preserveState: true });
    };

    return (
        <AdminLayout user={auth.user} header={`Detail Paket: ${paket?.nama_paket}`}>
            <Head title={`Paket ${paket?.nama_paket}`} />

            <div className="mb-6">
                <Link
                    href={route('paket-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Paket
                </Link>
            </div>

            {/* Header Paket Detail */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{paket?.nama_paket}</h2>
                        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                            {paket?.deskripsi || 'Tidak ada deskripsi tersedia.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                            paket?.status === 'aktif'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                            {paket?.status === 'aktif' ? 'Status: Aktif' : 'Status: Nonaktif'}
                        </span>
                        <Link
                            href={route('paket-latihan.edit', paket.id_paket)}
                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors"
                        >
                            <Edit size={16} />
                            Edit Paket
                        </Link>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Total Soal</p>
                        <p className="text-xl font-bold text-slate-800">{soals.length}</p>
                    </div>
                    {/* Add more stats if needed here */}
                </div>
            </div>

            {/* List Soal Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-slate-800">Daftar Soal</h3>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full sm:w-auto flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#1b5e20] focus-within:ring-[#1b5e20] focus-within:ring-1 transition-colors">
                        <Search size={18} className="text-slate-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari soal..."
                            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-600 w-full sm:w-48 placeholder-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <Link
                        href={route('soal.create', { paket_id: paket.id_paket })}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1b5e20] hover:bg-[#508953] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shrink-0"
                    >
                        <Plus size={18} />
                        <span>Tambah Soal</span>
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                {soals.length > 0 ? (
                    soals.map((soal, index) => (
                        <div key={soal.id_soal} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                            {soal.kategori}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            soal.tingkat_kesulitan === 'easy' ? 'bg-green-100 text-green-700' :
                                            soal.tingkat_kesulitan === 'medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {soal.tingkat_kesulitan}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                                            soal.status === 'aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
                                        }`}>
                                            {soal.status === 'aktif' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                            {soal.status}
                                        </span>
                                    </div>
                                    
                                    <div 
                                        className="text-slate-800 font-medium leading-relaxed mb-4 prose prose-sm max-w-none prose-img:rounded-md prose-img:max-h-48 prose-img:object-cover"
                                        dangerouslySetInnerHTML={{ __html: soal.konten_soal }}
                                    />

                                    {soal.jenis_soal === 'pilihan_ganda' ? (
                                        <div className="flex flex-wrap gap-2">
                                            {soal.pilihan_jawaban.map((pil) => (
                                                <div key={pil.kode_pilihan} className={`px-3 py-1.5 rounded-lg border text-sm flex items-center gap-2 ${
                                                    pil.kode_pilihan === soal.kunci_jawaban
                                                        ? 'bg-green-50 border-green-200 text-green-800 font-semibold'
                                                        : 'bg-white border-slate-200 text-slate-600'
                                                }`}>
                                                    <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                                                        pil.kode_pilihan === soal.kunci_jawaban ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {pil.kode_pilihan}
                                                    </span>
                                                    <span className="truncate max-w-[150px]">{pil.teks_pilihan}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                                            <span className="text-xs text-slate-500 font-semibold uppercase">Kunci:</span>
                                            <span className="text-sm font-semibold text-slate-800">{soal.kunci_jawaban}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <Link
                                        href={route('soal.edit', soal.id_soal)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 p-2 px-4 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        <Edit size={16} />
                                        <span className="sm:hidden">Edit</span>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(soal.id_soal)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 p-2 px-4 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        <span className="sm:hidden">Hapus</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                            <Plus size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Soal</h4>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Paket latihan ini belum memiliki soal. Silakan tambahkan soal untuk memulai.
                        </p>
                        <Link
                            href={route('soal.create', { paket_id: paket.id_paket })}
                            className="inline-flex items-center gap-2 bg-[#1b5e20] hover:bg-[#508953] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            Tambah Soal Pertama
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
