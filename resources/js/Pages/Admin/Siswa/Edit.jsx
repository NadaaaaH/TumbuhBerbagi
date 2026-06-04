import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Edit({ auth, siswa }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: siswa.nama || '',
        email: siswa.email || '',
        password: '',
        no_handphone: siswa.no_handphone || '',
        status_akun: siswa.status_akun || 'Aktif',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('siswa.update', siswa.id_siswa));
    };

    return (
        <AdminLayout user={auth.user} header="Edit Data Siswa">
            <Head title={`Edit Siswa - ${siswa.nama}`} />

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
                                    <InputLabel htmlFor="password" value="Kata Sandi (Opsional)" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Kosongkan jika tidak ingin mengubah kata sandi.</p>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="no_handphone" value="No. Handphone" />
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
                                    <InputLabel value="Status Akun" />
                                    <div className="mt-2 flex items-center gap-4">
                                        {/* Toggle Track */}
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={data.status_akun === 'aktif' || data.status_akun === 'Aktif'}
                                            onClick={() => setData('status_akun', (data.status_akun === 'aktif' || data.status_akun === 'Aktif') ? 'nonaktif' : 'aktif')}
                                            className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${
                                                (data.status_akun === 'aktif' || data.status_akun === 'Aktif')
                                                    ? 'bg-[#1b5e20] border-[#1b5e20]'
                                                    : 'bg-slate-200 border-slate-200'
                                            }`}
                                        >
                                            {/* Thumb */}
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                                                    (data.status_akun === 'aktif' || data.status_akun === 'Aktif')
                                                        ? 'translate-x-[40px]'
                                                        : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                        {/* Label */}
                                        <span className={`text-sm font-semibold transition-colors duration-200 ${
                                            (data.status_akun === 'aktif' || data.status_akun === 'Aktif')
                                                ? 'text-[#1b5e20]'
                                                : 'text-slate-400'
                                        }`}>
                                            {(data.status_akun === 'aktif' || data.status_akun === 'Aktif') ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
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
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
