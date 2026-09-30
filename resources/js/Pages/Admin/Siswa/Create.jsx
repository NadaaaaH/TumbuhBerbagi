import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        email: '',
        password: '',
        no_handphone: '',
        asal_sekolah: '',
        target_kampus: '',
        batch: '',
        status_akun: 'Aktif',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('siswa.store'));
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3.5">
                    <Link href={route('siswa.index')}>
                        <PrimaryButton className="gap-2 !py-2 !px-4 text-xs sm:text-sm font-semibold shadow-sm hover:shadow">
                            <ArrowLeft size={16} />
                            Kembali
                        </PrimaryButton>
                    </Link>
                    <span>Tambah Siswa Baru</span>
                </div>
            }
        >
            <Head title="Tambah Siswa" />

            <div className="w-full">
                <ContainerWhite className="w-full !p-6 md:!p-8 shadow-sm">
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
                                    placeholder="Contoh: 081234567890"
                                />
                                <InputError message={errors.no_handphone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="asal_sekolah" value="Asal Sekolah (Opsional)" />
                                <TextInput
                                    id="asal_sekolah"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.asal_sekolah}
                                    onChange={(e) => setData('asal_sekolah', e.target.value)}
                                    placeholder="Contoh: SMAN 1 Jakarta"
                                />
                                <InputError message={errors.asal_sekolah} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="target_kampus" value="Target Kampus (Opsional)" />
                                <TextInput
                                    id="target_kampus"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.target_kampus}
                                    onChange={(e) => setData('target_kampus', e.target.value)}
                                    placeholder="Contoh: ITB - Teknik Informatika"
                                />
                                <InputError message={errors.target_kampus} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="batch" value="Batch Learning Camp (Opsional)" />
                                <TextInput
                                    id="batch"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.batch}
                                    onChange={(e) => setData('batch', e.target.value)}
                                    placeholder="Contoh: 1 atau Batch 1"
                                />
                                <p className="text-xs text-slate-400 mt-1">Jika dikosongkan, profil siswa hanya akan tertulis &quot;Learning Camp&quot;.</p>
                                <InputError message={errors.batch} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Status Akun" />
                                <div className="mt-2 flex items-center gap-4">
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
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                                                (data.status_akun === 'aktif' || data.status_akun === 'Aktif')
                                                    ? 'translate-x-[40px]'
                                                    : 'translate-x-0.5'
                                            }`}
                                        />
                                    </button>
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

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <Link
                                href={route('siswa.index')}
                                className="inline-flex items-center px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                className="gap-2 !py-2.5 !px-6 text-sm font-semibold shadow-sm hover:shadow-md"
                            >
                                <Save size={18} />
                                Simpan Siswa
                            </PrimaryButton>
                        </div>
                    </form>
                </ContainerWhite>
            </div>
        </AdminLayout>
    );
}

