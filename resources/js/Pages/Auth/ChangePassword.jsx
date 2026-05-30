import React, { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { KeyRound, Lock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

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
        <div className="flex items-center gap-2 text-sm transition-all duration-300">
            {isValid ? (
                <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            ) : (
                <XCircle size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={isValid ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-500 dark:text-slate-400"}>
                {text}
            </span>
        </div>
    );

    return (
        <GuestLayout>
            <Head title="Ganti Kata Sandi" />

            <div className="max-w-md w-full mx-auto space-y-6 py-4">
                {/* Visual Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm">
                            <KeyRound size={40} className="stroke-[1.5]" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            Perbarui Kata Sandi Anda
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Demi keamanan akun Anda, silakan ubah kata sandi sementara dari admin.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md rounded-2xl overflow-hidden p-6 md:p-8 space-y-6">
                    <form onSubmit={submit} className="space-y-5">
                        {/* New Password Input */}
                        <div className="space-y-1">
                            <InputLabel htmlFor="password" value="Kata Sandi Baru" className="text-slate-700 dark:text-slate-300 font-semibold" />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Lock size={18} />
                                </span>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-1">
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" className="text-slate-700 dark:text-slate-300 font-semibold" />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Lock size={18} />
                                </span>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        {/* Real-time Validation Requirements Panel */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 space-y-2.5">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Persyaratan Kata Sandi:
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                                {renderIndicator(requirements.length, "Minimal 8 karakter")}
                                {renderIndicator(requirements.hasLetter, "Mengandung huruf (A-Z, a-z)")}
                                {renderIndicator(requirements.hasNumber, "Mengandung angka (0-9)")}
                                {renderIndicator(requirements.match, "Konfirmasi sandi cocok")}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#1b5e20] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#144718] transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:hover:bg-[#1b5e20] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            >
                                Perbarui & Lanjutkan
                                <ArrowRight size={18} className="shrink-0" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
