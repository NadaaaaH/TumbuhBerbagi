import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';

export default function VerifyEmail({ auth, status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const targetEmail = auth?.user?.email || 'email Anda';

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="max-w-md w-full mx-auto text-center space-y-6 py-4">
                {/* Visual Icon Header */}
                <div className="flex justify-center">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm animate-bounce">
                        <Mail size={40} className="stroke-[1.5]" />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        Verifikasi Email Anda
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Satu langkah lagi untuk memulai belajar
                    </p>
                </div>

                {/* Main Notification Banner */}
                <div className="flex items-start gap-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl text-left shadow-sm">
                    <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                        Silakan verifikasi email Anda terlebih dahulu untuk mengakses seluruh fitur aplikasi.
                    </p>
                </div>

                {/* Email Destination Info */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 text-left space-y-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Email Tujuan Verifikasi
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
                        <Mail size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{targetEmail}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                        Kami telah mengirimkan tautan verifikasi otomatis ke alamat email di atas. Silakan periksa kotak masuk atau folder spam Anda.
                    </p>
                </div>

                {/* Status Alert */}
                {status === 'verification-link-sent' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3.5 rounded-xl text-sm font-medium text-emerald-800 dark:text-emerald-300 animate-pulse text-left">
                        Tautan verifikasi baru berhasil dikirim ke email Anda. Silakan periksa kembali kotak masuk Anda.
                    </div>
                )}

                {/* Action Buttons */}
                <form onSubmit={submit} className="pt-2">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#1b5e20] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#144718] transition-all shadow-sm hover:shadow-md disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            <RefreshCw size={18} className={`shrink-0 ${processing ? 'animate-spin' : ''}`} />
                            Kirim Ulang Email Verifikasi
                        </button>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            <LogOut size={18} className="shrink-0" />
                            Keluar
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
