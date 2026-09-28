import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';

export default function UpdateProfileInformation({
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(user.foto_profil_url || null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'patch',
            nama: user.nama || '',
            no_handphone: user.no_handphone || '',
            asal_sekolah: user.asal_sekolah || '',
            target_kampus: user.target_kampus || '',
            foto_profil: null,
            hapus_foto: false,
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
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                {/* Foto Profil Section */}
                <div>
                    <InputLabel value="Foto Profil" />
                    <div className="mt-2.5 flex items-center gap-5">
                        <div className="relative group shrink-0">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Foto Profil"
                                    className="h-20 w-20 rounded-2xl object-cover shadow-sm border-2 border-slate-200"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-2xl bg-[#fcc526] text-slate-900 flex items-center justify-center font-black text-3xl shadow-sm">
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
                        isFocused
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

                <div className="flex items-center gap-3 pt-2">
                    <PrimaryButton disabled={processing} className="bg-[#1b5e20] hover:bg-[#144718]">
                        Simpan Perubahan
                    </PrimaryButton>

                    <Link
                        href={route('profile.show')}
                        className="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </Link>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            Berhasil disimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
