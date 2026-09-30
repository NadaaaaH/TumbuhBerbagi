import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import RichTextEditor from '@/Components/RichTextEditor';
import { ArrowLeft, Save, Upload } from 'lucide-react';

import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nama_kegiatan: '',
        deskripsi: '',
        gambar: null,
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        status: 'Aktif',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('kegiatan.store'));
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3.5">
                    <Link href={route('kegiatan.index')}>
                        <PrimaryButton className="gap-2 !py-2 !px-4 text-xs sm:text-sm font-semibold shadow-sm hover:shadow">
                            <ArrowLeft size={16} />
                            Kembali
                        </PrimaryButton>
                    </Link>
                    <span>Tambah Kegiatan Baru</span>
                </div>
            }
        >
            <Head title="Tambah Kegiatan" />

            <div className="w-full">
                <ContainerWhite className="w-full !p-6 md:!p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                            
                            <div>
                                <InputLabel htmlFor="nama_kegiatan" value="Judul Informasi / Kegiatan" />
                                <TextInput
                                    id="nama_kegiatan"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.nama_kegiatan}
                                    onChange={(e) => setData('nama_kegiatan', e.target.value)}
                                    required
                                    placeholder="Contoh: Pengumuman Seleksi Tahap 2"
                                />
                                <InputError message={errors.nama_kegiatan} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="deskripsi" value="Deskripsi Lengkap" />
                                <div className="mt-1">
                                    <RichTextEditor
                                        value={data.deskripsi}
                                        onChange={(html) => setData('deskripsi', html)}
                                        placeholder="Tuliskan detail informasi atau deskripsi kegiatan di sini..."
                                    />
                                </div>
                                <InputError message={errors.deskripsi} className="mt-2" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="tanggal" value="Tanggal Kegiatan (Opsional)" />
                                    <TextInput
                                        id="tanggal"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                    />
                                    <InputError message={errors.tanggal} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="waktu_mulai" value="Waktu Mulai" />
                                        <TextInput
                                            id="waktu_mulai"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={data.waktu_mulai}
                                            onChange={(e) => setData('waktu_mulai', e.target.value)}
                                        />
                                        <InputError message={errors.waktu_mulai} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="waktu_selesai" value="Waktu Selesai" />
                                        <TextInput
                                            id="waktu_selesai"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={data.waktu_selesai}
                                            onChange={(e) => setData('waktu_selesai', e.target.value)}
                                        />
                                        <InputError message={errors.waktu_selesai} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Status Tampil" />
                                    <div className="mt-2 flex items-center gap-4">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={data.status === 'Aktif'}
                                            onClick={() => setData('status', data.status === 'Aktif' ? 'Nonaktif' : 'Aktif')}
                                            className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${
                                                data.status === 'Aktif'
                                                    ? 'bg-[#1b5e20] border-[#1b5e20]'
                                                    : 'bg-slate-200 border-slate-200'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                                                    data.status === 'Aktif'
                                                        ? 'translate-x-[40px]'
                                                        : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                        <span className={`text-sm font-semibold transition-colors duration-200 ${
                                            data.status === 'Aktif'
                                                ? 'text-[#1b5e20]'
                                                : 'text-slate-400'
                                        }`}>
                                            {data.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="gambar" value="Poster / Foto (Opsional)" />
                                    <div className="mt-1 flex items-center gap-4">
                                        <label className="flex-1 flex flex-col items-center justify-center w-full h-10 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Upload size={16} />
                                                <span className="font-semibold">Klik untuk unggah</span>
                                            </div>
                                            <input 
                                                id="gambar" 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => setData('gambar', e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    {data.gambar && (
                                        <p className="mt-2 text-sm text-[#1b5e20] flex items-center gap-1">
                                            ✓ File terpilih: {data.gambar.name}
                                        </p>
                                    )}
                                    <InputError message={errors.gambar} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-6 border-t border-slate-100 mt-8 gap-4">
                                <Link
                                    href={route('kegiatan.index')}
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
                                    Simpan Kegiatan
                                </PrimaryButton>
                            </div>
                        </form>
                </ContainerWhite>
            </div>
        </AdminLayout>
    );
}
