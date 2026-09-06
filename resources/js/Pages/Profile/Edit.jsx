import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head, Link } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { ArrowLeft, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
    };

    return (
        <SiswaLayout user={auth.user} header="Edit Profil">
            <Head title="Edit Profil" />

            <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                className="max-w-2xl space-y-6 pb-16"
            >
                {/* Page Header */}
                <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Link
                        href={route('profile.show')}
                        className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#1b5e20] hover:border-[#1b5e20]/30 hover:bg-emerald-50 transition-all"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight">Edit Profil</h1>
                        <p className="text-slate-400 text-xs mt-0.5 font-light">Perbarui informasi akun dan kata sandi Anda.</p>
                    </div>
                </motion.div>

                {/* Profile Information Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-7 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[2rem] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
                        <User size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <User size={16} className="text-[#1b5e20]" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800 font-['Poppins']">
                                Informasi Profil
                            </h2>
                        </div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-full"
                        />
                    </div>
                </motion.div>

                {/* Password Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-7 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[2rem] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.04] text-[#1b5e20]">
                        <Shield size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Shield size={16} className="text-[#1b5e20]" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800 font-['Poppins']">
                                Keamanan Akun
                            </h2>
                        </div>
                        <UpdatePasswordForm className="max-w-full" />
                    </div>
                </motion.div>
            </motion.div>
        </SiswaLayout>
    );
}
