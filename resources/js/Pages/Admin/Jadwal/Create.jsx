import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { ArrowLeft, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nama_jadwal: '',
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        status: 'aktif',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('jadwal.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Jadwal berhasil ditambahkan!',
                    confirmButtonColor: '#1b5e20'
                });
            }
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header="Tambah Jadwal Baru"
        >
            <Head title="Tambah Jadwal" />

            <div className="mb-6">
                <Link
                    href={route('jadwal.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Jadwal
                </Link>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div>
                                <InputLabel htmlFor="nama_jadwal" value="Nama Jadwal / Kegiatan" />
                                <TextInput
                                    id="nama_jadwal"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.nama_jadwal}
                                    onChange={(e) => setData('nama_jadwal', e.target.value)}
                                    required
                                    placeholder="Contoh: Sesi Mentoring Batch 1, Kelas Online Matematika"
                                    disabled={processing}
                                />
                                <InputError message={errors.nama_jadwal} className="mt-2" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="tanggal" value="Tanggal Jadwal" />
                                    <TextInput
                                        id="tanggal"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        required
                                        disabled={processing}
                                    />
                                    <InputError message={errors.tanggal} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="aktif">Aktif (Ditampilkan)</option>
                                        <option value="nonaktif">Nonaktif (Disembunyikan)</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
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
                                        required
                                        disabled={processing}
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
                                        placeholder="Otomatis 1 jam setelah waktu mulai jika kosong"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.waktu_selesai} className="mt-2" />
                                    <p className="text-xs text-slate-500 mt-1">Opsional - Akan otomatis diisi 1 jam setelah waktu mulai jika kosong</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <Link
                                    href={route('jadwal.index')}
                                    className="flex-1 px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors text-center"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-[#1b5e20] hover:bg-[#508953] disabled:bg-slate-400 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
