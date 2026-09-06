import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Edit({ auth, paket }) {
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

            <div className="max-w-3xl">
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
                                    className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${
                                        (data.status === 'aktif' || data.status === 'Aktif')
                                            ? 'bg-[#1b5e20] border-[#1b5e20]'
                                            : 'bg-slate-200 border-slate-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                                            (data.status === 'aktif' || data.status === 'Aktif')
                                                ? 'translate-x-[40px]'
                                                : 'translate-x-0.5'
                                        }`}
                                    />
                                </button>
                                <span className={`text-sm font-semibold transition-colors duration-200 ${
                                    (data.status === 'aktif' || data.status === 'Aktif')
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
        </AdminLayout>
    );
}
