import React, { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { KeyRound, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function ChangePassword() {
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const [requirements, setRequirements] = useState({
        length: false,
        hasLetter: false,
        hasNumber: false,
        match: false,
    });

    // Run password criteria validation in real-time
    useEffect(() => {
        const pass = data.password;
        const confirm = data.password_confirmation;

        setRequirements({
            length: pass.length >= 8,
            hasLetter: /[a-zA-Z]/.test(pass),
            hasNumber: /[0-9]/.test(pass),
            match: pass.length > 0 && pass === confirm,
        });
    }, [data.password, data.password_confirmation]);

    const submit = (e) => {
        e.preventDefault();
        put(route('password.change.save'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const isSubmitDisabled = 
        processing || 
        !requirements.length || 
        !requirements.hasLetter || 
        !requirements.hasNumber || 
        !requirements.match;

    const renderIndicator = (isValid, text) => (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
            {isValid ? (
                <CheckCircle2 size={15} className="text-[#1b5e20] shrink-0" />
            ) : (
                <XCircle size={15} className="text-slate-300 shrink-0" />
            )}
            <span className={isValid ? "text-black font-semibold" : "text-black"}>
                {text}
            </span>
        </div>
    );

    return (
        <GuestLayout>
            <Head title="Ganti Kata Sandi" />

            {/* Header: Logo hijau tanpa bg/border, judul dan deskripsi seperti Login */}
            <div className="mb-8 text-center">
                <div className="flex justify-center mb-3">
                    <KeyRound size={44} className="text-[#1b5e20] stroke-[1.8]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-['Poppins'] mb-2">
                    Perbarui Kata Sandi Anda
                </h2>
                <p className="text-slate-500 text-sm">
                    Demi keamanan akun Anda, silakan ubah kata sandi sementara dari admin.
                </p>
            </div>

            <form onSubmit={submit}>
                {/* Kata Sandi Baru */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Konfirmasi Kata Sandi */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Persyaratan Kata Sandi: Tanpa container/background, teks hitam */}
                <div className="mt-5 space-y-2">
                    <span className="text-xs font-bold text-black uppercase tracking-wider block">
                        Persyaratan Kata Sandi:
                    </span>
                    <div className="space-y-1.5">
                        {renderIndicator(requirements.length, "Minimal 8 karakter")}
                        {renderIndicator(requirements.hasLetter, "Mengandung huruf (A-Z, a-z)")}
                        {renderIndicator(requirements.hasNumber, "Mengandung angka (0-9)")}
                        {renderIndicator(requirements.match, "Konfirmasi sandi cocok")}
                    </div>
                </div>

                {/* Tombol: Menggunakan PrimaryButton */}
                <div className="mt-8">
                    <PrimaryButton
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full justify-center gap-2"
                    >
                        Perbarui & Lanjutkan
                        <ArrowRight size={16} />
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
