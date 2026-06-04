import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index({ auth, kegiatans }) {
    const sortedKegiatans = React.useMemo(() => {
        if (!kegiatans) return [];
        return [...kegiatans].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }, [kegiatans]);

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
        <SiswaLayout user={auth.user} header="Kegiatan & Informasi">
            <Head title="Kegiatan Siswa" />

            <div className="mb-8">
                <p className="text-slate-500 font-light leading-relaxed">
                    Kumpulan informasi penting, pengumuman terbaru, dan dokumentasi kegiatan akademik beasiswa Tumbuh Berbagi.
                </p>
            </div>

            {sortedKegiatans && sortedKegiatans.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-10"
                >
                    {/* Featured / Newest Kegiatan */}
                    {sortedKegiatans.slice(0, 1).map((kegiatan) => (
                        <motion.div
                            variants={cardVariants}
                            key={kegiatan.id_kegiatan}
                            className="bg-white rounded-[3rem] border border-slate-100/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8 flex flex-col lg:flex-row gap-8 min-h-[380px] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden text-left w-full"
                        >
                            {/* Image - Large Featured */}
                            <div className="w-full lg:w-[480px] h-64 lg:h-auto rounded-[2rem] overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/40">
                                {kegiatan.gambar_url || kegiatan.gambar ? (
                                    <img 
                                        src={kegiatan.gambar_url || `/storage/${kegiatan.gambar}`} 
                                        alt={kegiatan.nama_kegiatan} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa] text-slate-300">
                                        <Newspaper size={64} opacity={0.3} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1b5e20] shadow-sm flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    <span>{new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between py-2">
                                <div>
                                    <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-[#1b5e20] text-[10px] font-bold uppercase tracking-wider border border-emerald-100/60 shadow-sm mb-4">
                                        Kegiatan Terbaru
                                    </span>
                                    <h3 className="font-bold text-2xl sm:text-3xl text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-[#1b5e20] transition-colors font-['Poppins']">
                                        {kegiatan.nama_kegiatan}
                                    </h3>
                                    <p className="text-slate-500 font-light text-sm sm:text-base mb-6 leading-relaxed">
                                        {kegiatan.deskripsi}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <Link 
                                        href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-[#1b5e20]/30 transition-all group/btn shadow-sm active:scale-95"
                                    >
                                        <span>Baca Selengkapnya</span>
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Older Kegiatans List (Grid of smaller horizontal cards) */}
                    {sortedKegiatans.length > 1 && (
                        <div className="space-y-6 pt-4">
                            <h4 className="font-bold text-lg text-slate-700 font-['Poppins'] border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Newspaper size={20} className="text-[#1b5e20]" />
                                <span>Informasi & Kegiatan Lainnya</span>
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {sortedKegiatans.slice(1).map((kegiatan) => (
                                    <motion.div
                                        variants={cardVariants}
                                        key={kegiatan.id_kegiatan}
                                        className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 flex flex-col sm:flex-row gap-6 min-h-[220px] hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
                                    >
                                        {/* Image - Smaller */}
                                        <div className="w-full sm:w-[220px] h-44 sm:h-auto rounded-[1.5rem] overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/40">
                                            {kegiatan.gambar_url || kegiatan.gambar ? (
                                                <img 
                                                    src={kegiatan.gambar_url || `/storage/${kegiatan.gambar}`} 
                                                    alt={kegiatan.nama_kegiatan} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa] text-slate-300">
                                                    <Newspaper size={40} opacity={0.3} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#1b5e20] shadow-sm flex items-center gap-1">
                                                <Calendar size={10} />
                                                <span>{new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 mb-2.5 line-clamp-2 leading-tight group-hover:text-[#1b5e20] transition-colors font-['Poppins']">
                                                    {kegiatan.nama_kegiatan}
                                                </h3>
                                                <p className="text-slate-500 font-light text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
                                                    {kegiatan.deskripsi}
                                                </p>
                                            </div>

                                            <div className="mt-auto">
                                                <Link 
                                                    href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b5e20] hover:text-[#144718] transition-colors group/link"
                                                >
                                                    <span>Baca Selengkapnya</span>
                                                    <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform duration-300" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : (
                <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 shadow-sm text-center py-20 flex flex-col items-center justify-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4 text-slate-400">
                        <Newspaper size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 font-['Poppins']">Belum Ada Informasi</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-light text-sm leading-relaxed">
                        Saat ini belum ada informasi atau kegiatan terbaru yang dipublikasikan oleh admin.
                    </p>
                </div>
            )}

        </SiswaLayout>
    );
}
