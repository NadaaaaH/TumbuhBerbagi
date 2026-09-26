import React, { useState, useMemo } from 'react';
import { Link, Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import SearchBar from '@/Components/SearchBar';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ClipboardList, CheckCircle2, Clock, PlayCircle, Eye, Search, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TextInput from '@/Components/TextInput';

export default function Index({ auth, pakets = [], ongoingPackages = [], completedPackages = {} }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter packages by search query
    const filteredPakets = useMemo(() => {
        if (!pakets) return [];
        return pakets.filter(paket =>
            paket.nama_paket.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pakets, searchQuery]);

    // Split packages into active (unfinished) and completed
    const activePakets = useMemo(() => {
        return filteredPakets.filter(paket => !completedPackages.hasOwnProperty(paket.id_paket));
    }, [filteredPakets, completedPackages]);

    const finishedPakets = useMemo(() => {
        return filteredPakets.filter(p => completedPackages.hasOwnProperty(p.id_paket));
    }, [filteredPakets, completedPackages]);

    const isRiwayatMore = finishedPakets.length > activePakets.length;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
    };

    return (
        <SiswaLayout user={auth.user} header="Latihan Soal UTBK">
            <Head title="Latihan Soal" />

            <div className="space-y-10 pb-16">

                {/* Search Bar & Description */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-['Poppins'] tracking-tight">
                            Latihan Soal <span className="text-[#1b5e20]">Tumbuh Berbagi</span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Asah kemampuan UTBK Anda secara terarah dengan paket soal berkualitas.</p>
                    </div>

                    {/* Search Input */}
                    <SearchBar
                        className="w-full md:w-72 shrink-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* SECTION 1: Latihan Soal Aktif (Belum Selesai) */}
                    <div className={`space-y-4 ${isRiwayatMore ? 'xl:col-span-1' : 'xl:col-span-2'}`}>
                        <div className="flex items-center gap-2.5">
                            <ClipboardList size={20} className="text-[#1b5e20]" />
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Latihan Soal Aktif</h3>
                        </div>

                        {activePakets.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className={`grid gap-4 pb-4 pt-2 ${isRiwayatMore ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}
                            >
                                {activePakets.map((paket) => {
                                    const isOngoing = ongoingPackages.includes(paket.id_paket);

                                    return (
                                        <ContainerWhite
                                            key={paket.id_paket}
                                            className="flex flex-col justify-between w-full group h-full"
                                        >
                                            <div className="space-y-4 flex-1 flex flex-col justify-between">
                                                <div className="space-y-3">
                                                    <h4 className="font-extrabold text-[#1a2530] text-lg line-clamp-1 leading-snug">
                                                        {paket.nama_paket}
                                                    </h4>

                                                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-normal min-h-[68px]">
                                                        {paket.deskripsi || 'Uji pemahaman Anda dengan paket latihan terarah ini.'}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                                                    <div className="flex items-center gap-3.5 text-xs text-slate-600 font-semibold">
                                                        <div className="flex items-center gap-1.5">
                                                            <FileText size={15} className="text-[#1b5e20]/80 shrink-0" />
                                                            <span>{paket.soal_count || 0} Soal</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={15} className="text-[#1b5e20]/80 shrink-0" />
                                                            <span>{paket.waktu_ujian > 0 ? `${paket.waktu_ujian} Menit` : 'Tidak Dibatasi'}</span>
                                                        </div>
                                                    </div>

                                                    {isOngoing ? (
                                                        <Link href={route('siswa.latihan.show', paket.id_paket)}>
                                                            <PrimaryButton className="px-4 py-2 text-xs bg-[#508953] hover:bg-[#3d6b40] focus:ring-[#508953] focus:border-[#508953] text-white border border-[#508953] gap-1.5 shrink-0 shadow-sm">
                                                                <PlayCircle size={13} /> Lanjutkan
                                                            </PrimaryButton>
                                                        </Link>
                                                    ) : (paket.tanggal_mulai && new Date() < new Date(paket.tanggal_mulai)) ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] text-slate-400 mb-1 font-medium">Buka: {new Date(paket.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB</span>
                                                            <PrimaryButton disabled className="px-4 py-2 text-xs gap-1.5 shrink-0 bg-slate-200 border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-400 cursor-not-allowed">
                                                                <PlayCircle size={13} /> Belum Dimulai
                                                            </PrimaryButton>
                                                        </div>
                                                    ) : (
                                                        <Link href={route('siswa.latihan.show', paket.id_paket)}>
                                                            <PrimaryButton className="px-4 py-2 text-xs gap-1.5 shrink-0">
                                                                <PlayCircle size={13} /> Mulai Latihan
                                                            </PrimaryButton>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </ContainerWhite>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <div className="p-8 text-center py-12 flex flex-col items-center justify-center">
                                <ClipboardList size={28} className="text-[#1b5e20]/60 mb-2" />
                                <h5 className="font-bold text-slate-700 text-sm">Tidak ada latihan aktif</h5>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">Semua paket latihan telah selesai dikerjakan atau kata kunci pencarian Anda tidak cocok.</p>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Riwayat Latihan (Sudah Selesai) */}
                    <div className={`space-y-4 ${isRiwayatMore ? 'xl:col-span-2' : 'xl:col-span-1'}`}>
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={20} className="text-[#fcc526]" />
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Riwayat Latihan</h3>
                        </div>

                        {finishedPakets.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className={`grid gap-4 pb-4 pt-2 ${isRiwayatMore ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}
                            >
                                {finishedPakets.map((paket) => (
                                    <ContainerWhite
                                        key={paket.id_paket}
                                        className="flex flex-col justify-between w-full group h-full"
                                    >
                                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-3 flex-1 min-w-0">
                                                    <h4 className="font-extrabold text-[#1a2530] text-lg line-clamp-1 leading-snug">
                                                        {paket.nama_paket}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-normal min-h-[68px]">
                                                        {paket.deskripsi || 'Uji pemahaman Anda dengan paket latihan terarah ini.'}
                                                    </p>
                                                </div>
                                                {paket.tampil_hasil === 'terjadwal' && paket.tanggal_tampil_hasil && new Date() < new Date(paket.tanggal_tampil_hasil) ? (
                                                    <div className="text-center sm:text-right shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nilai Akhir</p>
                                                        <p className="text-lg font-black text-slate-400 leading-none">PENDING</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center sm:text-right shrink-0 px-3 py-2">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Nilai Akhir</p>
                                                        <p className="text-2xl font-black text-[#d99b00] leading-none">{Math.round(completedPackages[paket.id_paket])}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                                                <div className="flex items-center gap-3.5 text-xs text-slate-600 font-semibold">
                                                    <div className="flex items-center gap-1.5">
                                                        <FileText size={15} className="text-[#1b5e20]/80 shrink-0" />
                                                        <span>{paket.soal_count || 0} Soal</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={15} className="text-[#1b5e20]/80 shrink-0" />
                                                        <span>{paket.waktu_ujian > 0 ? `${paket.waktu_ujian} Menit` : 'Tidak Dibatasi'}</span>
                                                    </div>
                                                </div>

                                                {paket.tampil_hasil === 'terjadwal' && paket.tanggal_tampil_hasil && new Date() < new Date(paket.tanggal_tampil_hasil) ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] text-slate-400 font-medium">Bisa dilihat pada {new Date(paket.tanggal_tampil_hasil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <SecondaryButton disabled className="px-4 py-2 text-xs gap-1.5 shrink-0 opacity-50 cursor-not-allowed">
                                                            <Eye size={13} /> Lihat Hasil
                                                        </SecondaryButton>
                                                    </div>
                                                ) : (
                                                    <Link href={route('siswa.latihan.hasil', paket.id_paket)}>
                                                        <SecondaryButton className="px-4 py-2 text-xs gap-1.5 shrink-0">
                                                            <Eye size={13} /> Lihat Hasil
                                                        </SecondaryButton>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </ContainerWhite>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="p-8 text-center py-12 flex flex-col items-center justify-center">
                                <CheckCircle2 size={28} className="text-blue-600/60 mb-2" />
                                <h5 className="font-bold text-slate-700 text-sm">Belum ada riwayat Latihan</h5>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">Selesaikan paket latihan pertama Anda untuk melihat statistik peringkat dan pembahasan di sini.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </SiswaLayout>
    );
}
