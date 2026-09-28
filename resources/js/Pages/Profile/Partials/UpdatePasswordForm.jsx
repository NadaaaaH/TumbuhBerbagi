import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        email: user?.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateSecurity = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updateSecurity} className="space-y-6">
                <div>
                    <InputLabel htmlFor="security_email" value="Alamat Email" />

                    <TextInput
                        id="security_email"
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
                        Kosongkan bagian ini jika hanya ingin mengubah email.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <InputLabel
                                htmlFor="current_password"
                                value="Kata Sandi Saat Ini"
                            />

                            <TextInput
                                id="current_password"
                                ref={currentPasswordInput}
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
                                ref={passwordInput}
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

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="bg-[#1b5e20] hover:bg-[#144718]">
                        Simpan Keamanan
                    </PrimaryButton>

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
