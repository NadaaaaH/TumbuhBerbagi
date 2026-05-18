import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        email: '',
        password: '',
        no_handphone: '',
        status_akun: 'Aktif',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('siswa.store'));
    };

    return (
        <AdminLayout user={auth.user} header="Tambah Siswa Baru">
            <Head title="Tambah Siswa" />

            <div className="max-w-3xl">
                <div className="mb-6">
                    <Link href={route('siswa.index')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={16} /> Kembali ke Daftar Siswa
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                    <TextInput
                                        id="nama"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nama} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email (Gmail)" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Kata Sandi Sementara" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Siswa dapat mengubahnya nanti setelah login.</p>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="no_handphone" value="No. Handphone (Opsional)" />
                                    <TextInput
                                        id="no_handphone"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.no_handphone}
                                        onChange={(e) => setData('no_handphone', e.target.value)}
                                    />
                                    <InputError message={errors.no_handphone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status_akun" value="Status Akun" />
                                    <select
                                        id="status_akun"
                                        className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-[#1b5e20] focus:ring-[#1b5e20] py-2.5"
                                        value={data.status_akun}
                                        onChange={(e) => setData('status_akun', e.target.value)}
                                        required
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Nonaktif">Nonaktif</option>
                                    </select>
                                    <InputError message={errors.status_akun} className="mt-2" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <Link
                                    href={route('siswa.index')}
                                    className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 bg-[#1b5e20] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#144718] transition-colors shadow-sm hover:shadow disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    Simpan Siswa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
