import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function KegiatanSection({ kegiatans, onSelectKegiatan }) {
    const hasKegiatans = kegiatans && kegiatans.length > 0;
    const mainKegiatan = hasKegiatans ? kegiatans[0] : null;
    const secondaryKegiatans = hasKegiatans ? kegiatans.slice(1, 3) : [];

    return (
        <div className="relative">
            {/* Top Animated Wave Divider (Smooth & Fluid) */}
            <div className="relative w-full overflow-hidden leading-none z-10 -mb-1 pointer-events-none">
                <svg
                    className="relative block w-full h-14 sm:h-20 md:h-24 lg:h-28 text-[#1b5e20]"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    {/* Ombak belakang */}
                    <motion.path
                        fill="#329a39"
                        opacity="0.3"
                        animate={{
                            d: [
                                "M0,40 C150,80 300,80 450,40 C600,0 750,0 900,40 C1050,80 1120,75 1200,45 L1200,120 L0,120 Z",

                                "M0,50 C150,15 300,15 450,50 C600,85 750,85 900,50 C1050,15 1120,20 1200,50 L1200,120 L0,120 Z",

                                "M0,35 C150,70 300,75 450,40 C600,5 750,5 900,45 C1050,80 1120,75 1200,40 L1200,120 L0,120 Z",

                                "M0,40 C150,80 300,80 450,40 C600,0 750,0 900,40 C1050,80 1120,75 1200,45 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Ombak tengah */}
                    <motion.path
                        fill="#2e7d32"
                        opacity="0.45"
                        animate={{
                            d: [
                                "M0,50 C150,20 300,20 450,50 C600,80 750,80 900,50 C1050,20 1120,25 1200,50 L1200,120 L0,120 Z",

                                "M0,40 C150,70 300,70 450,40 C600,10 750,10 900,45 C1050,75 1120,70 1200,40 L1200,120 L0,120 Z",

                                "M0,55 C150,25 300,25 450,55 C600,85 750,85 900,55 C1050,25 1120,30 1200,55 L1200,120 L0,120 Z",

                                "M0,50 C150,20 300,20 450,50 C600,80 750,80 900,50 C1050,20 1120,25 1200,50 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Ombak utama */}
                    <motion.path
                        fill="currentColor"
                        animate={{
                            d: [
                                "M0,45 C150,75 300,75 450,45 C600,15 750,15 900,45 C1050,75 1120,70 1200,45 L1200,120 L0,120 Z",

                                "M0,55 C150,25 300,25 450,55 C600,85 750,85 900,55 C1050,25 1120,30 1200,55 L1200,120 L0,120 Z",

                                "M0,35 C150,65 300,65 450,35 C600,5 750,5 900,35 C1050,65 1120,60 1200,35 L1200,120 L0,120 Z",

                                "M0,45 C150,75 300,75 450,45 C600,15 750,15 900,45 C1050,75 1120,70 1200,45 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 5.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </svg>
            </div>

            <section id="kegiatan" className="py-2 sm:py-4 bg-gradient-to-b from-[#1b5e20] to-[#124216] text-white relative z-20">
                <div className="max-w-6xl mx-auto px-6">

                    {/* Section Header */}
                    <div className="mb-8 sm:mb-10 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                                Informasi{' '}
                                <span className="text-[#1b5e20] bg-white px-5 py-1.5 sm:px-6 sm:py-2 rounded-2xl inline-block shadow-md">
                                    Kegiatan
                                </span>
                            </h2>
                            <p className="text-emerald-100/90 max-w-2xl mx-auto font-light leading-relaxed text-sm sm:text-base">
                                Berita dan aktivitas terbaru dari komunitas Tumbuh Berbagi.
                            </p>
                        </motion.div>
                    </div>

                    {hasKegiatans ? (
                        <div className="space-y-6">

                            {/* Main Featured Kegiatan (Large card) */}
                            {mainKegiatan && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <button
                                        onClick={() => onSelectKegiatan(mainKegiatan)}
                                        className="text-left w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-8 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 group"
                                    >
                                        {/* Image container */}
                                        <div className="w-full md:w-[48%] h-60 sm:h-72 md:h-[300px] rounded-[1.8rem] overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/50">
                                            {mainKegiatan.gambar_url ? (
                                                <img
                                                    src={mainKegiatan.gambar_url}
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
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-500">
                                                        {new Date(mainKegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-slate-800 mb-4 group-hover: leading-tight">
                                                    {mainKegiatan.nama_kegiatan}
                                                </h3>
                                                <p className="text-slate-500 font-light text-sm sm:text-base line-clamp-3 sm:line-clamp-4 leading-relaxed mb-6">
                                                    {mainKegiatan.deskripsi}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="text-[#1b5e20] inline-flex items-center gap-2 text-xs sm:text-sm font-bold transition-all duration-300">
                                                    <span>Baca Selengkapnya</span>
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            )}

                            {/* Secondary Kegiatan (2 side-by-side cards below) */}
                            {secondaryKegiatans.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {secondaryKegiatans.map((kegiatan, idx) => (
                                        <motion.div
                                            key={kegiatan.id_kegiatan}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                                        >
                                            <button
                                                onClick={() => onSelectKegiatan(kegiatan)}
                                                className="text-left w-full bg-white rounded-[1rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_14px_35px_rgba(0,0,0,0.035)] flex flex-row gap-5 p-5 transition-all duration-300 hover:-translate-y-0.5 group h-full"
                                            >
                                                {/* Small Image */}
                                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/50">
                                                    {kegiatan.gambar_url ? (
                                                        <img
                                                            src={kegiatan.gambar_url}
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
                                                        <h4 className="font-['Poppins'] font-bold text-base sm:text-lg text-slate-800 mb-2 line-clamp-1 group-hover: leading-tight">
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
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 mx-auto max-w-4xl px-6 shadow-sm">
                            <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 text-lg">Belum ada informasi kegiatan.</p>
                        </div>
                    )}

                </div>
            </section>

            {/* Bottom Animated Wave Divider (Smooth & Fluid) */}
            <div className="relative w-full overflow-hidden leading-none z-10 -mt-1 pointer-events-none rotate-180">
                <svg
                    className="relative block w-full h-14 sm:h-20 md:h-24 lg:h-28 text-[#124216]"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    {/* Wave belakang */}
                    <motion.path
                        fill="#329a39"
                        opacity="0.3"
                        animate={{
                            d: [
                                "M0,35 C150,75 300,75 450,40 C600,5 750,5 900,40 C1050,75 1120,75 1200,45 L1200,120 L0,120 Z",

                                "M0,45 C150,25 300,25 450,50 C600,75 750,75 900,50 C1050,25 1120,25 1200,45 L1200,120 L0,120 Z",

                                "M0,40 C150,65 300,70 450,40 C600,10 750,10 900,45 C1050,70 1120,70 1200,40 L1200,120 L0,120 Z",

                                "M0,35 C150,75 300,75 450,40 C600,5 750,5 900,40 C1050,75 1120,75 1200,45 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Wave tengah */}
                    <motion.path
                        fill="#2e7d32"
                        opacity="0.45"
                        animate={{
                            d: [
                                "M0,45 C150,20 300,20 450,50 C600,80 750,80 900,50 C1050,20 1120,20 1200,45 L1200,120 L0,120 Z",

                                "M0,55 C150,30 300,30 450,55 C600,80 750,80 900,55 C1050,30 1120,30 1200,55 L1200,120 L0,120 Z",

                                "M0,35 C150,60 300,60 450,35 C600,10 750,10 900,35 C1050,60 1120,60 1200,35 L1200,120 L0,120 Z",

                                "M0,45 C150,20 300,20 450,50 C600,80 750,80 900,50 C1050,20 1120,20 1200,45 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Wave depan */}
                    <motion.path
                        fill="currentColor"
                        animate={{
                            d: [
                                "M0,40 C150,70 300,70 450,40 C600,10 750,10 900,40 C1050,70 1120,70 1200,40 L1200,120 L0,120 Z",

                                "M0,50 C150,25 300,25 450,50 C600,75 750,75 900,50 C1050,25 1120,25 1200,50 L1200,120 L0,120 Z",

                                "M0,35 C150,65 300,65 450,35 C600,5 750,5 900,35 C1050,65 1120,65 1200,35 L1200,120 L0,120 Z",

                                "M0,40 C150,70 300,70 450,40 C600,10 750,10 900,40 C1050,70 1120,70 1200,40 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 5.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </svg>
            </div>
        </div>
    );
}
