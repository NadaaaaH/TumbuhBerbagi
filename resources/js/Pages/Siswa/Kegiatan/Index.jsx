import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KegiatanModal from '@/Pages/Welcome/Partials/KegiatanModal';
export default function Index({ auth, kegiatans }) {
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);

    const sortedKegiatans = kegiatans || [];

    const mainKegiatan = sortedKegiatans.length > 0 ? sortedKegiatans[0] : null;
    const secondaryKegiatans = sortedKegiatans.length > 1 ? sortedKegiatans.slice(1) : [];

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

    // Strip HTML tags untuk preview deskripsi
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    return (
        <SiswaLayout user={auth.user} header="Kegiatan & Informasi">
            <Head title="Kegiatan Siswa" />

            <div className="space-y-2 mb-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight">
                    Berita dari
                    <span className="text-[#1b5e20]">
                        {" "}Tumbuh Berbagi
                    </span>
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-light">
                    Kegiatan dan informasi terkini dari Tumbuh Berbagi.
                </p>
            </div>

            {sortedKegiatans && sortedKegiatans.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    {/* Main Featured Kegiatan (Large Card) */}
                    {mainKegiatan && (
                        <motion.div
                            variants={cardVariants}
                            key={mainKegiatan.id_kegiatan}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedKegiatan(mainKegiatan)}
                                className="block group text-left w-full cursor-pointer"
                            >
                                <ContainerWhite className="hover:-translate-y-0.5 !p-6 sm:!p-8">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Image container */}
                                        <div className="w-full md:w-[48%] h-60 sm:h-72 md:h-[300px] rounded-[1.8rem] overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/50">
                                            {mainKegiatan.gambar_url || mainKegiatan.gambar ? (
                                                <img
                                                    src={mainKegiatan.gambar_url || `/storage/${mainKegiatan.gambar}`}
                                                    alt={mainKegiatan.nama_kegiatan}
                                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                                    <Calendar size={56} opacity={0.3} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Text content */}
                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div>
                                                <div className="mb-4">
                                                    <span className="text-xs font-semibold text-slate-400">
                                                        {new Date(mainKegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-slate-800 group-hover:text-[#1b5e20] mb-4 transition-colors leading-tight">
                                                    {mainKegiatan.nama_kegiatan}
                                                </h3>
                                                <p className="text-slate-500 font-light text-sm sm:text-base line-clamp-3 sm:line-clamp-4 leading-relaxed mb-6">
                                                    {stripHtml(mainKegiatan.deskripsi)}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="text-[#1b5e20] inline-flex items-center gap-2 text-xs sm:text-sm font-bold transition-all duration-300">
                                                    <span>Baca Selengkapnya</span>
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ContainerWhite>
                            </button>
                        </motion.div>
                    )}

                    {/* Secondary / Other Kegiatans (Grid of horizontal cards) */}
                    {secondaryKegiatans.length > 0 && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {secondaryKegiatans.map((kegiatan) => (
                                    <motion.div
                                        key={kegiatan.id_kegiatan}
                                        variants={cardVariants}
                                        className="h-full"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelectedKegiatan(kegiatan)}
                                            className="block group h-full text-left w-full cursor-pointer"
                                        >
                                            <ContainerWhite className="hover:-translate-y-0.5 !p-5 h-full">
                                                <div className="flex flex-row gap-5 h-full">
                                                    {/* Small Image */}
                                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/50">
                                                        {kegiatan.gambar_url || kegiatan.gambar ? (
                                                            <img
                                                                src={kegiatan.gambar_url || `/storage/${kegiatan.gambar}`}
                                                                alt={kegiatan.nama_kegiatan}
                                                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                                                <Calendar size={32} opacity={0.3} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Text */}
                                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                                        <div>
                                                            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold block mb-1">
                                                                {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <h4 className="font-['Poppins'] font-bold text-base sm:text-lg text-slate-800 mb-2 line-clamp-1 group-hover:text-[#1b5e20] transition-colors leading-tight">
                                                                {kegiatan.nama_kegiatan}
                                                            </h4>
                                                            <p className="text-slate-500 font-light text-xs sm:text-sm line-clamp-2 leading-relaxed">
                                                                {kegiatan.deskripsi}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 text-xs font-bold text-[#1b5e20] inline-flex items-center gap-1">
                                                            <span>Baca Selengkapnya</span>
                                                            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </ContainerWhite>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : (
                <ContainerWhite className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4 text-slate-400">
                        <Newspaper size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 font-['Poppins']">Belum Ada Informasi</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-light text-sm leading-relaxed">
                        Saat ini belum ada informasi atau kegiatan terbaru yang dipublikasikan oleh admin.
                    </p>
                </ContainerWhite>
            )}

            {/* Popup Modal Detail Kegiatan */}
            <AnimatePresence>
                {selectedKegiatan && (
                    <KegiatanModal
                        kegiatan={selectedKegiatan}
                        auth={auth}
                        onClose={() => setSelectedKegiatan(null)}
                    />
                )}
            </AnimatePresence>

        </SiswaLayout>
    );
}
