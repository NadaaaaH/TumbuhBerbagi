import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nama_paket: '',
        deskripsi: '',
        status: 'aktif',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('paket-latihan.store'));
    };

    return (
        <AdminLayout user={auth.user} header="Tambah Paket Latihan">
            <Head title="Tambah Paket" />

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
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6">
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
                                Simpan Paket
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
