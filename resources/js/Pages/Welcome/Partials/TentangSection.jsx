import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { value: '500+', label: 'Siswa Terdaftar' },
    { value: '50+',  label: 'Mentor Aktif' },
    { value: '3',    label: 'Tahun Berdiri' },
    { value: '98%',  label: 'Kelulusan PTN' },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function TentangSection() {
    return (
        <div className="relative">
            {/* Top Animated Wave Divider */}
            <div className="relative w-full overflow-hidden leading-none z-10 -mb-1 pointer-events-none">
                <svg
                    className="relative block w-full h-12 sm:h-16 md:h-20 text-[#1b5e20]"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        fill="#329a39"
                        opacity="0.35"
                        animate={{
                            d: [
                                "M0,18 C220,80 430,8 670,82 C870,130 1070,25 1200,60 L1200,120 L0,120 Z",
                                "M0,30 C200,20 450,75 630,35 C830,15 1030,85 1200,40 L1200,120 L0,120 Z",
                                "M0,18 C220,80 430,8 670,82 C870,130 1070,25 1200,60 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path
                        fill="currentColor"
                        animate={{
                            d: [
                                "M0,32 C310,105 610,22 910,82 C1060,112 1155,58 1200,72 L1200,120 L0,120 Z",
                                "M0,45 C280,30 580,90 880,45 C1040,20 1140,75 1200,55 L1200,120 L0,120 Z",
                                "M0,32 C310,105 610,22 910,82 C1060,112 1155,58 1200,72 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>
            </div>

            <section id="tentang" className="py-20 bg-gradient-to-b from-[#1b5e20] to-[#124216] text-white relative z-20">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="space-y-8"
                    >
                        {/* Highlighted Title */}
                        <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.25] max-w-3xl mx-auto">
                            Mengantarkan Langkahmu Menuju{' '}
                            <span className="text-[#1b5e20] bg-white px-4 py-1.5 rounded-2xl inline-block shadow-md">
                                Gerbang PTN.
                            </span>
                        </h2>
                        
                        {/* Subtitle / Description */}
                        <p className="text-emerald-100/90 font-light text-sm sm:text-base md:text-lg mb-12 leading-relaxed max-w-3xl mx-auto">
                            Portal pembelajaran interaktif dengan bimbingan akademis, mentoring intensif, serta bank soal terlengkap untuk mendukung persiapan optimal Anda menembus perguruan tinggi negeri impian.
                        </p>

                        {/* Stats List */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-emerald-800/60">
                            {stats.map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-['Poppins'] text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-emerald-200/80 uppercase tracking-wider font-bold">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bottom Animated Wave Divider */}
            <div className="relative w-full overflow-hidden leading-none z-10 -mt-1 pointer-events-none rotate-180">
                <svg
                    className="relative block w-full h-12 sm:h-16 md:h-20 text-[#124216]"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        fill="#329a39"
                        opacity="0.35"
                        animate={{
                            d: [
                                "M0,18 C220,80 430,8 670,82 C870,130 1070,25 1200,60 L1200,120 L0,120 Z",
                                "M0,30 C200,20 450,75 630,35 C830,15 1030,85 1200,40 L1200,120 L0,120 Z",
                                "M0,18 C220,80 430,8 670,82 C870,130 1070,25 1200,60 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path
                        fill="currentColor"
                        animate={{
                            d: [
                                "M0,32 C310,105 610,22 910,82 C1060,112 1155,58 1200,72 L1200,120 L0,120 Z",
                                "M0,45 C280,30 580,90 880,45 C1040,20 1140,75 1200,55 L1200,120 L0,120 Z",
                                "M0,32 C310,105 610,22 910,82 C1060,112 1155,58 1200,72 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>
            </div>
        </div>
    );
}
