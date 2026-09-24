import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function VerifyEmail({ auth, status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const targetEmail = auth?.user?.email || 'email Anda';

    return (
        <GuestLayout maxWidth="sm:max-w-xl">
            <Head title="Verifikasi Email" />

            <div className="w-full mx-auto text-center space-y-6 py-2">
                {/* Logo / Ilustrasi Pesan */}
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="flex justify-center -mb-1"
                >
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <img
                            src="/images/Verifimg.svg"
                            alt="Verifikasi Email"
                            className="w-14 sm:w-16 h-auto drop-shadow-md select-none my-5 mx-auto"
                        />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-850 font-['Poppins'] tracking-tight">
                        Verifikasi Email Anda
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Satu langkah lagi untuk memulai belajar
                    </p>
                </div>


                {/* Email Tujuan Verifikasi (Tanpa bg dan border) */}
                <div className="space-y-1.5 text-center">
                    <span className="text-xs font-bold text-black uppercase tracking-wider block">
                        Email Tujuan Verifikasi
                    </span>
                    <p className="text-lg sm:text-xl font-extrabold text-[#1b5e20] tracking-tight">
                        {targetEmail}
                    </p>
                    <p className="text-xs text-black leading-relaxed pt-1 max-w-md mx-auto">
                        Kami telah mengirimkan tautan verifikasi otomatis ke alamat email di atas. Silakan periksa kotak masuk atau folder spam Anda.
                    </p>
                </div>

                {/* Status Alert */}
                {status === 'verification-link-sent' && (
                    <div className="text-sm font-semibold text-[#1b5e20] bg-emerald-50/60 py-2.5 px-4 rounded-xl">
                        Tautan verifikasi baru berhasil dikirim ke email Anda. Silakan periksa kembali kotak masuk Anda.
                    </div>
                )}

                {/* Action Buttons */}
                <form onSubmit={submit} className="pt-2">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold shadow-md whitespace-nowrap"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                        </PrimaryButton>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs whitespace-nowrap"
                        >
                            Kembali
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
