import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ContainerWhite from '@/Components/ContainerWhite';
import SecondIcon from '@/Components/SecondIcon';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { User, Shield, Camera, Trash2 } from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const user = auth.user;
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(user.foto_profil_url || null);

    const {
        data,
        setData,
        post,
        errors,
        processing,
        recentlySuccessful,
        reset,
    } = useForm({
        _method: 'patch',
        nama: user.nama || '',
        no_handphone: user.no_handphone || '',
        asal_sekolah: user.asal_sekolah || '',
        target_kampus: user.target_kampus || '',
        foto_profil: null,
        hapus_foto: false,
        email: user.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                foto_profil: file,
                hapus_foto: false,
            }));
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setData((prev) => ({
            ...prev,
            foto_profil: null,
            hapus_foto: true,
        }));
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
    };

    return (
        <SiswaLayout user={user} header="Edit Profil">
            <Head title="Edit Profil" />

            <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                className="w-full space-y-6 pb-16"
            >
                {/* Page Header (Without back button) */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight">
                        Edit Profil
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-light">
                        Perbarui informasi data diri, alamat email, dan kata sandi akun Anda.
                    </p>
                </motion.div>

                {/* Form containing both containers and external action buttons */}
                <form onSubmit={submit} className="space-y-6">
                    {/* 2 Columns Grid Layout */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
                    >
                        {/* Left Column: ContainerWhite Informasi Profil */}
                        <ContainerWhite className="relative overflow-hidden">
                            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                                <SecondIcon icon={User} iconSize={20} />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 font-['Poppins'] tracking-tight">
                                        Informasi Profil
                                    </h2>
                                    <p className="text-slate-400 text-xs sm:text-sm font-light mt-0.5">
                                        Data identitas diri dan akademik Anda.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Foto Profil */}
                                <div>
                                    <InputLabel value="Foto Profil" />
                                    <div className="mt-2.5 flex items-center gap-5">
                                        <div className="relative group shrink-0">
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Foto Profil"
                                                    className="h-20 w-20 rounded-full object-cover shadow-sm border-2 border-slate-200"
                                                />
                                            ) : (
                                                <div className="h-20 w-20 rounded-full bg-[#fcc526] text-slate-900 flex items-center justify-center font-black text-3xl shadow-sm">
                                                    {user?.nama?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handlePhotoChange}
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                                >
                                                    <Camera size={14} />
                                                    {photoPreview ? 'Ganti Foto' : 'Unggah Foto'}
                                                </button>

                                                {photoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemovePhoto}
                                                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Format: JPG, PNG, atau WEBP. Maksimal 2MB.
                                            </p>
                                            <InputError message={errors.foto_profil} className="mt-1" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                    <TextInput
                                        id="nama"
                                        className="mt-1 block w-full"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                        autoComplete="name"
                                    />
                                    <InputError className="mt-2" message={errors.nama} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="no_handphone" value="No. Handphone" />
                                    <TextInput
                                        id="no_handphone"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.no_handphone}
                                        onChange={(e) => setData('no_handphone', e.target.value)}
                                        autoComplete="tel"
                                        placeholder="Contoh: 081234567890"
                                    />
                                    <InputError className="mt-2" message={errors.no_handphone} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="asal_sekolah" value="Asal Sekolah" />
                                    <TextInput
                                        id="asal_sekolah"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.asal_sekolah}
                                        onChange={(e) => setData('asal_sekolah', e.target.value)}
                                        placeholder="Contoh: SMAN 1 Jakarta"
                                    />
                                    <InputError className="mt-2" message={errors.asal_sekolah} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="target_kampus" value="Target Kampus" />
                                    <TextInput
                                        id="target_kampus"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.target_kampus}
                                        onChange={(e) => setData('target_kampus', e.target.value)}
                                        placeholder="Contoh: Institut Pertanian Bogor - Ilmu Komputer"
                                    />
                                    <InputError className="mt-2" message={errors.target_kampus} />
                                </div>
                            </div>
                        </ContainerWhite>

                        {/* Right Column: ContainerWhite Keamanan Akun & Action Buttons directly underneath */}
                        <div className="space-y-4">
                            <ContainerWhite className="relative overflow-hidden">
                                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                                    <SecondIcon icon={Shield} iconSize={20} />
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 font-['Poppins'] tracking-tight">
                                            Keamanan Akun
                                        </h2>
                                        <p className="text-slate-400 text-xs sm:text-sm font-light mt-0.5">
                                            Kelola alamat email dan kata sandi akun Anda.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <InputLabel htmlFor="email" value="Alamat Email" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="username"
                                        />
                                        <InputError className="mt-2" message={errors.email} />

                                        {mustVerifyEmail && user.email_verified_at === null && (
                                            <div className="mt-2">
                                                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                                                    Alamat email Anda belum terverifikasi.
                                                    <Link
                                                        href={route('verification.send')}
                                                        method="post"
                                                        as="button"
                                                        className="font-bold underline ml-1 text-amber-800 hover:text-amber-950"
                                                    >
                                                        Kirim ulang verifikasi.
                                                    </Link>
                                                </p>

                                                {status === 'verification-link-sent' && (
                                                    <div className="mt-1.5 text-xs font-semibold text-emerald-600">
                                                        Tautan verifikasi baru telah dikirim ke email Anda.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Ganti Kata Sandi
                                        </p>
                                        <p className="text-xs text-slate-400 mb-4">
                                            Kosongkan bagian ini jika tidak ingin mengubah kata sandi.
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <InputLabel
                                                    htmlFor="current_password"
                                                    value="Kata Sandi Saat Ini"
                                                />
                                                <TextInput
                                                    id="current_password"
                                                    value={data.current_password}
                                                    onChange={(e) =>
                                                        setData('current_password', e.target.value)
                                                    }
                                                    type="password"
                                                    className="mt-1 block w-full"
                                                    autoComplete="current-password"
                                                    placeholder="Masukkan kata sandi saat ini"
                                                />
                                                <InputError
                                                    message={errors.current_password}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                                                <TextInput
                                                    id="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    type="password"
                                                    className="mt-1 block w-full"
                                                    autoComplete="new-password"
                                                    placeholder="Minimal 8 karakter"
                                                />
                                                <InputError message={errors.password} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="password_confirmation"
                                                    value="Konfirmasi Kata Sandi Baru"
                                                />
                                                <TextInput
                                                    id="password_confirmation"
                                                    value={data.password_confirmation}
                                                    onChange={(e) =>
                                                        setData('password_confirmation', e.target.value)
                                                    }
                                                    type="password"
                                                    className="mt-1 block w-full"
                                                    autoComplete="new-password"
                                                    placeholder="Ulangi kata sandi baru"
                                                />
                                                <InputError
                                                    message={errors.password_confirmation}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ContainerWhite>

                            {/* Action buttons directly underneath the right container */}
                            <div className="flex items-center justify-end gap-3 pt-1">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-emerald-600 font-medium mr-1">
                                        Berhasil disimpan.
                                    </p>
                                </Transition>

                                <Link
                                    href={route('profile.show')}
                                    className="inline-flex items-center px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>

                                <PrimaryButton
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#1b5e20] hover:bg-[#144718] px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm"
                                >
                                    Simpan Perubahan
                                </PrimaryButton>
                            </div>
                        </div>
                    </motion.div>
                </form>
            </motion.div>
        </SiswaLayout>
    );
}
