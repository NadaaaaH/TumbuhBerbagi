import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Edit({ auth, jadwal }) {
    const existingImage = jadwal.gambar ? `/storage/${jadwal.gambar}` : null;
    const [imagePreview, setImagePreview] = useState(existingImage);
    const [removeGambar, setRemoveGambar] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        nama_jadwal: jadwal.nama_jadwal || '',
        deskripsi: jadwal.deskripsi || '',
        tanggal: jadwal.tanggal || '',
        waktu_mulai: jadwal.waktu_mulai || '',
        waktu_selesai: jadwal.waktu_selesai || '',
        status: jadwal.status || 'aktif',
        gambar: null,
        remove_gambar: false,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('gambar', file);
            setData('remove_gambar', false);
            setImagePreview(URL.createObjectURL(file));
            setRemoveGambar(false);
        }
    };

    const removeImage = () => {
        setData('gambar', null);
        setData('remove_gambar', true);
        setImagePreview(null);
        setRemoveGambar(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('jadwal.update', jadwal.id_jadwal), {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Jadwal berhasil diperbarui!',
                    confirmButtonColor: '#1b5e20'
                });
            }
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header="Edit Jadwal"
        >
            <Head title="Edit Jadwal" />

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
                                    disabled={processing}
                                />
                                <InputError message={errors.nama_jadwal} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="deskripsi" value="Deskripsi (Opsional)" />
                                <textarea
                                    id="deskripsi"
                                    className="mt-1 block w-full border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-lg shadow-sm text-sm px-4 py-2.5 resize-none"
                                    rows={3}
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Deskripsi singkat tentang jadwal ini..."
                                    disabled={processing}
                                />
                                <InputError message={errors.deskripsi} className="mt-2" />
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
                                    <InputLabel value="Status" />
                                    <div className="mt-2 flex items-center gap-4">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={data.status === 'aktif' || data.status === 'Aktif'}
                                            onClick={() => setData('status', (data.status === 'aktif' || data.status === 'Aktif') ? 'nonaktif' : 'aktif')}
                                            disabled={processing}
                                            className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${
                                                (data.status === 'aktif' || data.status === 'Aktif')
                                                    ? 'bg-[#1b5e20] border-[#1b5e20]'
                                                    : 'bg-slate-200 border-slate-200'
                                            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            </div>

                            {/* Upload Gambar Banner */}
                            <div>
                                <InputLabel htmlFor="gambar" value="Gambar Banner (Opsional)" />
                                <p className="text-xs text-slate-400 mt-0.5 mb-2">Gambar akan ditampilkan sebagai banner card jadwal di halaman siswa. Rasio 16:9 disarankan.</p>
                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                                        <img
                                            src={imagePreview}
                                            alt="Preview banner"
                                            className="w-full h-40 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-700 rounded-full p-1.5 shadow transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1b5e20]/80 to-transparent h-12" />
                                        <label htmlFor="gambar" className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-2 py-1 rounded-lg shadow cursor-pointer transition-all">
                                            Ganti Gambar
                                        </label>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="gambar"
                                        className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#1b5e20] hover:bg-green-50/40 transition-all"
                                    >
                                        <ImagePlus size={28} className="text-slate-300 mb-2" />
                                        <span className="text-xs text-slate-400 font-medium">Klik untuk upload gambar</span>
                                        <span className="text-xs text-slate-300 mt-0.5">JPG, PNG, WEBP — maks. 2MB</span>
                                    </label>
                                )}
                                <input
                                    id="gambar"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={processing}
                                />
                                <InputError message={errors.gambar} className="mt-2" />
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
                                        disabled={processing}
                                    />
                                    <InputError message={errors.waktu_selesai} className="mt-2" />
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
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
