import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save, Trash2, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import ContainerWhite from '@/Components/ContainerWhite';

export default function Edit({ auth, paket, soals = [] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSoals = soals.filter((s) =>
        s.konten_soal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kategori?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.materi?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { data, setData, put, processing, errors } = useForm({
        nama_paket: paket?.nama_paket || '',
        deskripsi: paket?.deskripsi || '',
        tipe: paket?.tipe || 'latihan',
        status: paket?.status || 'aktif',
        waktu_ujian: paket?.waktu_ujian || 0,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('paket-latihan.update', paket.id_paket));
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Hapus Paket Latihan?',
            text: 'Seluruh soal dan data sesi latihan siswa yang terhubung dengan paket ini akan dihapus secara permanen.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-3xl p-6 shadow-xl',
                confirmButton: 'rounded-xl px-5 py-3 font-medium text-sm',
                cancelButton: 'rounded-xl px-5 py-3 font-medium text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('paket-latihan.destroy', paket.id_paket), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Paket latihan berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#1b5e20',
                            customClass: {
                                popup: 'rounded-3xl p-6 shadow-xl',
                                confirmButton: 'rounded-xl px-5 py-3 font-medium text-sm'
                            }
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header="Edit Paket Latihan">
            <Head title="Edit Paket" />

            <div className="mb-6">
                <Link
                    href={route('paket-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Paket
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                <div className="w-full">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="nama_paket" value="Nama Paket" />
                                <TextInput
                                    id="nama_paket"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.nama_paket}
                                    onChange={(e) => setData('nama_paket', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nama_paket} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="tipe" value="Kategori / Tipe Paket" />
                                <select
                                    id="tipe"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full text-sm font-medium"
                                    value={data.tipe}
                                    onChange={(e) => setData('tipe', e.target.value)}
                                >
                                    <option value="latihan">Latihan Soal</option>
                                    <option value="tryout">Try Out</option>
                                </select>
                                <InputError message={errors.tipe} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                                <textarea
                                    id="deskripsi"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    rows={4}
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                />
                                <InputError message={errors.deskripsi} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="waktu_ujian" value="Waktu Ujian (Menit)" />
                                <TextInput
                                    id="waktu_ujian"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.waktu_ujian}
                                    onChange={(e) => setData('waktu_ujian', e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Biarkan 0 jika waktu ujian tidak dibatasi.</p>
                                <InputError message={errors.waktu_ujian} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Status" />
                                <div className="mt-2 flex items-center gap-4">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={data.status === 'aktif' || data.status === 'Aktif'}
                                        onClick={() => setData('status', (data.status === 'aktif' || data.status === 'Aktif') ? 'nonaktif' : 'aktif')}
                                        className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${(data.status === 'aktif' || data.status === 'Aktif')
                                            ? 'bg-[#1b5e20] border-[#1b5e20]'
                                            : 'bg-slate-200 border-slate-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${(data.status === 'aktif' || data.status === 'Aktif')
                                                ? 'translate-x-[40px]'
                                                : 'translate-x-0.5'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-sm font-semibold transition-colors duration-200 ${(data.status === 'aktif' || data.status === 'Aktif')
                                        ? 'text-[#1b5e20]'
                                        : 'text-slate-400'
                                        }`}>
                                        {(data.status === 'aktif' || data.status === 'Aktif') ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between pt-6">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-medium transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Hapus Paket
                                </button>
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={route('paket-latihan.index')}
                                        className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#1b5e20] hover:bg-[#508953] text-white px-8 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-full lg:w-[520px] shrink-0">
                    <ContainerWhite className="sticky top-4">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <h4 className="text-base font-semibold text-slate-800">Daftar Soal</h4>
                                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-md">
                                    {soals.length} soal
                                </span>
                            </div>
                            <Link
                                href={route('paket-latihan.show', paket.id_paket)}
                                className="flex items-center gap-1.5 text-sm text-white bg-[#1b5e20] hover:bg-[#144718] px-3.5 py-2 rounded-xl font-medium transition-colors"
                            >
                                <Plus size={14} />
                                Kelola Soal
                            </Link>
                        </div>

                        {/* Search */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mb-4 focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-colors">
                            <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari soal..."
                                className="bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-700 w-full placeholder-slate-400 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Soal List */}
                        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                            {filteredSoals.length > 0 ? (
                                filteredSoals.map((soal, idx) => (
                                    <div
                                        key={soal.id_soal}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
                                    >
                                        {/* Nomor */}
                                        <span className="text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5">
                                            {idx + 1}.
                                        </span>

                                        {/* Konten */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 line-clamp-2 leading-snug">
                                                {soal.konten_soal?.replace(/<[^>]+>/g, '') || '(Soal tanpa teks)'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                {soal.kategori && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20]">
                                                        {soal.kategori}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 uppercase font-medium">
                                                    {soal.jenis_soal === 'pilihan_ganda' ? 'PG' : 'Isian'}
                                                </span>
                                                {soal.tingkat_kesulitan && (
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${soal.tingkat_kesulitan === 'mudah' ? 'bg-emerald-50 text-emerald-700' :
                                                        soal.tingkat_kesulitan === 'sulit' ? 'bg-rose-50 text-rose-700' :
                                                            'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {soal.tingkat_kesulitan === 'mudah' ? 'Mudah' : soal.tingkat_kesulitan === 'sulit' ? 'Sulit' : 'Sedang'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit link */}
                                        <Link
                                            href={route('soal.edit', soal.id_soal)}
                                            className="shrink-0 text-slate-300 hover:text-[#1b5e20] transition-colors opacity-0 group-hover:opacity-100"
                                            title="Edit soal"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    {searchQuery ? `Tidak ada soal yang cocok dengan "${searchQuery}".` : 'Belum ada soal di paket ini.'}
                                </div>
                            )}
                        </div>
                    </ContainerWhite>
                </div>
            </div>
        </AdminLayout>
    );
}
