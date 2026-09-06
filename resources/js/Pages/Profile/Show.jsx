import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head, Link } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ContainerWhite from '@/Components/ContainerWhite';
import SecondaryButton from '@/Components/SecondaryButton';
import TertiaryButton from '@/Components/TertiaryButton';
import FirstIcon from '@/Components/FirstIcon';
import SecondIcon from '@/Components/SecondIcon';
import { motion } from 'framer-motion';
import React from 'react';
import {
    Mail,
    Phone,
    School,
    GraduationCap,
    Users,
    Target,
    Pencil,
    User,
    BarChart3,
    BookOpen,
    CheckSquare,
    Crosshair,
} from 'lucide-react';

export default function Show({ auth, user: propUser, stats = {} }) {
    const user = propUser || auth?.user;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 18 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 120, damping: 16 }
        }
    };

    const infoFields = [
        {
            icon: Mail,
            label: 'Email',
            value: user?.email || '-',
        },
        {
            icon: Phone,
            label: 'Nomor Telepon',
            value: user?.no_handphone || '-',
        },
        {
            icon: School,
            label: 'Asal Sekolah',
            value: user?.asal_sekolah || '-',
        },
        {
            icon: Target,
            label: 'Target Kampus',
            value: user?.target_kampus || '-',
        },
    ];

    const statCards = [
        {
            label: 'Rata-Rata Skor',
            value: stats?.rata_rata_skor ?? '-',
            icon: BarChart3,
            color: 'text-[#1b5e20]',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Tryout Selesai',
            value: stats?.tryout_selesai ?? '-',
            icon: CheckSquare,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Latihan Soal Dikerjakan',
            value: stats?.soal_dikerjakan != null
                ? Number(stats.soal_dikerjakan).toLocaleString('id-ID')
                : '-',
            icon: BookOpen,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
        },
        {
            label: 'Akurasi Jawaban',
            value: stats?.akurasi != null ? `${stats.akurasi}%` : '-',
            icon: Crosshair,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    return (
        <SiswaLayout user={auth?.user} header="Profil Saya">
            <Head title="Profil Saya" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-16 w-full"
            >
                {/* Page Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight">
                        Profil Saya
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-light">
                        Data diri dan ringkasan perjalanan belajar Anda.
                    </p>
                </motion.div>

                {/* Main Profile Card Row */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-stretch"
                >
                    {/* Left: Avatar Card */}
                    <div className="bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] rounded-[2rem] p-8 flex flex-col items-center justify-between text-white text-center shadow-[0_8px_40px_rgba(27,94,32,0.25)] min-h-[260px]">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                            <div className="h-20 w-20 rounded-[100rem] bg-[#fcc526] text-slate-900 flex items-center justify-center font-black text-4xl shadow-lg">
                                {user?.nama?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                                <p className="text-xl font-extrabold font-['Poppins'] leading-snug">
                                    {user?.nama || 'Siswa'}
                                </p>
                                <p className="text-[#fcc526] font-semibold text-sm mt-0.5">
                                    Siswa Beasiswa
                                </p>
                                <p className="text-white/60 text-xs mt-1 font-light">
                                    {user?.batch
                                        ? `Learning Camp ${user.batch.toString().toLowerCase().includes('batch') ? user.batch : `Batch ${user.batch}`}`
                                        : 'Learning Camp'}
                                </p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <Link href={route('profile.edit')} className="mt-6 w-full">
                            <TertiaryButton className="w-full gap-2">
                                <Pencil size={14} />
                                Edit Profil
                            </TertiaryButton>
                        </Link>
                    </div>

                    {/* Right: Info Card */}
                    <ContainerWhite className="flex flex-col justify-between">
                        <div>
                            <h2 className="font-bold text-slate-800 text-[20px] font-['Poppins'] mb-10">
                                Informasi Akun
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                                {infoFields.map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3.5">
                                        <SecondIcon icon={Icon} iconSize={18} />
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-400 font-medium leading-none mb-1.5">
                                                {label}
                                            </p>
                                            <p
                                                className="text-sm font-semibold text-slate-800 truncate"
                                                title={value}
                                            >
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ContainerWhite>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {statCards.map(({ label, value, icon: Icon }) => (
                        <ContainerWhite
                            key={label}
                            className="hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <FirstIcon icon={Icon} iconSize={18} />
                                <p className="text-[15px] font-bold text-slate-700 tracking-tight leading-snug">
                                    {label}
                                </p>
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight">
                                    {value}
                                </p>
                            </div>
                        </ContainerWhite>
                    ))}
                </motion.div>
            </motion.div>
        </SiswaLayout>
    );
}
