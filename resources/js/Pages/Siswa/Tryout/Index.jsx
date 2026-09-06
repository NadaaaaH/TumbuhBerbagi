import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ClipboardList, CheckCircle2, Clock, PlayCircle, Eye, Search, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index({ auth, pakets = [], ongoingPackages = [], completedPackages = [] }) {
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
        return filteredPakets.filter(paket => !completedPackages.includes(paket.id_paket));
    }, [filteredPakets, completedPackages]);

    const finishedPakets = useMemo(() => {
        return filteredPakets.filter(paket => completedPackages.includes(paket.id_paket));
    }, [filteredPakets, completedPackages]);

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
        <SiswaLayout user={auth.user} header="Try Out UTBK">
            <Head title="Try Out" />

            <div className="space-y-10 pb-16">
                
                {/* Search Bar & Description */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xs">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Katalog Try Out</h2>
                        <p className="text-slate-450 text-xs mt-1 font-medium">Simulasi ujian Try Out terstandar untuk persiapan maksimal menghadapi UTBK.</p>
                    </div>
                    
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari paket try out..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20] text-sm shadow-3xs font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* SECTION 1: Try Out Aktif (Belum Selesai) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <ClipboardList size={20} className="text-[#1b5e20]" />
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Try Out Aktif</h3>
                        <span className="text-xs font-bold bg-emerald-50 text-[#1b5e20] px-2 py-0.5 rounded-lg border border-emerald-100">
                            {activePakets.length} Paket
                        </span>
                    </div>

                    {activePakets.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex gap-6 overflow-x-auto pb-4 pt-2 -mx-2 px-2 no-scrollbar scroll-smooth"
                        >
                            {activePakets.map((paket) => {
                                const isOngoing = ongoingPackages.includes(paket.id_paket);
                                
                                return (
                                    <motion.div 
                                        variants={cardVariants}
                                        key={paket.id_paket}
                                        className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between w-[300px] sm:w-[350px] shrink-0 relative overflow-hidden group"
                                    >
                                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center gap-2">
                                                    {isOngoing ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 uppercase tracking-wide animate-pulse">
                                                            <AlertCircle size={10} /> Sedang Dikerjakan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-[#1b5e20] text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">
                                                            Simulasi Siap
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="font-extrabold text-[#1a2530] text-lg line-clamp-1 group-hover:text-[#1b5e20] transition-colors leading-snug">
                                                    {paket.nama_paket}
                                                </h4>
                                                
                                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-normal">
                                                    {paket.deskripsi || 'Simulasi Try Out terstruktur dengan statistik skor & analisis jawaban.'}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
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
                                                    <Link 
                                                        href={route('siswa.tryout.show', paket.id_paket)}
                                                        className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 gap-1.5 shrink-0"
                                                    >
                                                        <PlayCircle size={13} />
                                                        <span>Lanjutkan</span>
                                                    </Link>
                                                ) : (
                                                    <Link 
                                                        href={route('siswa.tryout.show', paket.id_paket)}
                                                        className="inline-flex items-center justify-center bg-[#1b5e20] hover:bg-[#2d7e32] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 gap-1.5 shrink-0"
                                                    >
                                                        <PlayCircle size={13} />
                                                        <span>Mulai Try Out</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] text-center py-12 flex flex-col items-center justify-center">
                            <ClipboardList size={28} className="text-[#1b5e20]/60 mb-2" />
                            <h5 className="font-bold text-slate-700 text-sm">Tidak ada Try Out aktif</h5>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Semua paket Try Out telah selesai dikerjakan atau kata kunci pencarian Anda tidak cocok.</p>
                        </div>
                    )}
                </div>

                {/* SECTION 2: Riwayat Try Out (Sudah Selesai) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={20} className="text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Riwayat Try Out</h3>
                        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-100">
                            {finishedPakets.length} Paket
                        </span>
                    </div>

                    {finishedPakets.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex gap-6 overflow-x-auto pb-4 pt-2 -mx-2 px-2 no-scrollbar scroll-smooth"
                        >
                            {finishedPakets.map((paket) => (
                                <motion.div 
                                    variants={cardVariants}
                                    key={paket.id_paket}
                                    className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between w-[300px] sm:w-[350px] shrink-0 relative overflow-hidden group"
                                >
                                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-wide">
                                                    <CheckCircle2 size={10} /> Selesai
                                                </span>
                                            </div>

                                            <h4 className="font-extrabold text-[#1a2530] text-lg line-clamp-1 group-hover:text-blue-600 transition-colors leading-snug">
                                                {paket.nama_paket}
                                            </h4>
                                            
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-normal">
                                                {paket.deskripsi || 'Simulasi Try Out terstruktur dengan statistik skor & analisis jawaban.'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
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

                                            <Link 
                                                href={route('siswa.tryout.hasil', paket.id_paket)}
                                                className="inline-flex items-center justify-center bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 gap-1.5 shrink-0"
                                            >
                                                <Eye size={13} />
                                                <span>Lihat Hasil</span>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] text-center py-12 flex flex-col items-center justify-center">
                            <CheckCircle2 size={28} className="text-blue-600/60 mb-2" />
                            <h5 className="font-bold text-slate-700 text-sm">Belum ada riwayat Try Out</h5>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Selesaikan paket Try Out pertama Anda untuk melihat statistik peringkat dan pembahasan di sini.</p>
                        </div>
                    )}
                </div>

            </div>
        </SiswaLayout>
    );
}
