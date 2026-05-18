import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk Akun" />

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 font-['Poppins'] mb-2">Selamat Datang Kembali</h2>
                <p className="text-slate-500 text-sm">Masuk untuk mengakses portal akademikmu.</p>
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-[#1b5e20] bg-green-50 p-4 rounded-xl border border-green-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-3 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-[#1b5e20] hover:text-[#144718] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b5e20] focus:ring-offset-2 rounded-md"
                        >
                            Lupa kata sandi?
                        </Link>
                    )}
                </div>

                <div className="mt-8">
                    <PrimaryButton className="w-full" disabled={processing}>
                        Masuk Akun
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
