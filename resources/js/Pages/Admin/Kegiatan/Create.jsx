import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Swal from 'sweetalert2';

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
        post(route('kegiatan.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Kegiatan berhasil ditambahkan!',
                    confirmButtonColor: '#1b5e20'
                });
            }
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header="Tambah Kegiatan Baru"
        >
            <Head title="Tambah Kegiatan" />

            <div className="mb-6">
                <Link
                    href={route('kegiatan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Kegiatan
                </Link>
            </div>

            <div className="max-w-3xl">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
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
                                <textarea
                                    id="deskripsi"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    rows="5"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Tuliskan detail informasi atau deskripsi kegiatan di sini..."
                                ></textarea>
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
                                    <InputLabel htmlFor="status" value="Status Tampil" />
                                    <select
                                        id="status"
                                        className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="Aktif">Aktif (Ditampilkan ke Siswa)</option>
                                        <option value="Nonaktif">Nonaktif (Disembunyikan)</option>
                                    </select>
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
                                    className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#1b5e20] hover:bg-[#508953] text-white px-8 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    Simpan Kegiatan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
