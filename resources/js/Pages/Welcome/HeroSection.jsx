import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const heroPhotos = [
    // Left column A (offset top)
    [
        { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400", delay: 0.1, cls: "w-36 h-48 xl:w-44 xl:h-56" },
        { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&q=80&w=400", delay: 0.3, cls: "w-36 h-40 xl:w-44 xl:h-48" },
    ],
    // Left column B
    [
        { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=400", delay: 0.2, cls: "w-40 h-56 xl:w-48 xl:h-68" },
        { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=400", delay: 0.4, cls: "w-40 h-44 xl:w-48 xl:h-52" },
    ],
    // Right column C
    [
        { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400", delay: 0.2, cls: "w-40 h-56 xl:w-48 xl:h-68" },
        { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400", delay: 0.4, cls: "w-40 h-44 xl:w-48 xl:h-52" },
    ],
    // Right column D (offset top)
    [
        { src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=400", delay: 0.1, cls: "w-36 h-48 xl:w-44 xl:h-56" },
        { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400", delay: 0.3, cls: "w-36 h-40 xl:w-44 xl:h-48" },
    ],
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

function PhotoColumn({ photos, offsetTop = false }) {
    return (
        <div className={`flex flex-col gap-4 ${offsetTop ? 'mt-12' : ''}`}>
            {photos.map((photo, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: photo.delay, duration: 0.8 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`${photo.cls} rounded-[2rem] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.06)] bg-slate-200 border border-white`}
                >
                    <img src={photo.src} alt="" className="w-full h-full object-cover" />
                </motion.div>
            ))}
        </div>
    );
}

export default function HeroSection({ auth, dashboardRoute }) {
    return (
        <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-16 overflow-hidden">
            <div className="relative w-full">
                <div className="relative flex items-start justify-between w-full min-h-[480px] lg:min-h-[600px]">

                    {/* LEFT PHOTO COLUMNS */}
                    <div className="hidden lg:flex gap-3 pl-0 pt-4 flex-shrink-0">
                        <PhotoColumn photos={heroPhotos[0]} offsetTop />
                        <PhotoColumn photos={heroPhotos[1]} />
                    </div>

                    {/* CENTER TEXT */}
                    <div className="flex-1 flex flex-col items-center justify-center pt-10 pb-10 px-6 lg:px-12 min-h-[480px] lg:min-h-[600px]">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="flex flex-col items-center text-center w-full max-w-2xl"
                        >
                            <motion.h1
                                variants={fadeInUp}
                                className="font-['Poppins'] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-5 text-[#1a2530]"
                            >
                                Ruang Bertumbuh untuk{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b5e20] to-[#508953]">
                                    Pejuang Kampus Impian.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl font-light"
                            >
                                Platform untuk tumbuh, berbagi, dan berkolaborasi bersama demi mewujudkan Indonesia yang lebih cerdas dan berdampak.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-center">
                                <Link
                                    href={dashboardRoute}
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#1b5e20] text-white font-bold text-sm hover:bg-[#144718] hover:shadow-[0_8px_30px_rgba(27,94,32,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-emerald-900/10"
                                >
                                    {auth.user ? 'Buka E-Learning' : 'Masuk ke Sistem'}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                                <a
                                    href="#tentang"
                                    className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-slate-200 bg-white/60 hover:bg-white text-slate-600 font-bold text-sm hover:border-[#1b5e20]/30 hover:text-[#1b5e20] transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                                >
                                    Pelajari Lebih Lanjut
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* RIGHT PHOTO COLUMNS */}
                    <div className="hidden lg:flex gap-4 flex-shrink-0">
                        <PhotoColumn photos={heroPhotos[2]} />
                        <PhotoColumn photos={heroPhotos[3]} offsetTop />
                    </div>

                </div>
            </div>
        </section>
    );
}
