import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import TertiaryButton from '@/Components/TertiaryButton';

// Entrance Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 35, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.18, delayChildren: 0.2 }
    }
};

export default function HeroSection({ auth, dashboardRoute }) {
    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-28 pb-20 overflow-hidden bg-gradient-to-b from-[#FEF8DD]/30 via-[#fafbfc] to-white selection:bg-[#1b5e20] selection:text-white">

            {/* ================= BACKGROUND DECORATIONS (ANIMATED) ================= */}

            {/* Top-Right Pale Yellow Circle Blob (Entrance + Continuous Float) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 50, y: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 pointer-events-none -z-10"
            >
                <motion.div
                    animate={{
                        y: [0, -18, 0, 18, 0],
                        scale: [1, 1.04, 1, 0.98, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[450px] md:h-[450px] rounded-full bg-[#FEF8DD]"
                />
            </motion.div>

            {/* Top-Right Dark Green SVG Circle Arc (Entrance + Continuous Sway) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                className="absolute top-32 -right-36 sm:top-40 sm:-right-40 pointer-events-none -z-10"
            >
                <motion.svg
                    animate={{
                        rotate: [0, 6, 0, -6, 0],
                        y: [0, 12, 0, -12, 0],
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[520px] md:h-[520px] overflow-visible"
                    viewBox="0 0 500 500"
                    fill="none"
                >
                    <circle cx="340" cy="80" r="180" stroke="#1b5e20" strokeWidth="2.5" opacity="0.85" />
                </motion.svg>
            </motion.div>

            {/* Bottom-Left Pale Yellow Circle Blob (Entrance + Continuous Float) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -50, y: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                className="absolute -bottom-40 -left-40 sm:-bottom-28 sm:-left-28 pointer-events-none -z-10"
            >
                <motion.div
                    animate={{
                        y: [0, 20, 0, -20, 0],
                        scale: [1, 0.97, 1, 1.05, 1],
                    }}
                    transition={{
                        duration: 8.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] md:w-[450px] md:h-[450px] rounded-full bg-[#FEF8DD]"
                />
            </motion.div>

            {/* Bottom-Left Dark Green SVG Circle Arc (Entrance + Continuous Sway) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: 20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                className="absolute -bottom-16 left-12 sm:left-16 pointer-events-none -z-10"
            >
                <motion.svg
                    animate={{
                        rotate: [0, -8, 0, 8, 0],
                        x: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                        duration: 9.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[520px] md:h-[520px] overflow-visible"
                    viewBox="0 0 500 500"
                    fill="none"
                >
                    <circle cx="150" cy="420" r="190" stroke="#1b5e20" strokeWidth="2.5" opacity="0.85" />
                </motion.svg>
            </motion.div>

            {/* ================= FLOATING DECORATIONS ================= */}

            {/* Mortar Board (Topi.svg) - Entrance & Sway Left */}
            <motion.div
                initial={{ opacity: 0, x: -80, y: -30, rotate: -15, scale: 0.7 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="absolute left-3 sm:left-8 md:left-12 lg:left-36 top-20 sm:top-24 md:top-28 w-28 sm:w-44 md:w-56 lg:w-64 pointer-events-none z-10 hidden sm:block"
            >
                <motion.div
                    animate={{
                        y: [0, -15, 0, 15, 0],
                        rotate: [0, -4, 0, 4, 0],
                        scale: [1, 1.02, 1, 0.98, 1],
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src="/images/topi.svg"
                        alt="Dekorasi Topi Toga"
                        className="w-full h-auto drop-shadow-sm select-none"
                    />
                </motion.div>
            </motion.div>

            {/* Book (Buku.svg) - Entrance & Sway Right */}
            <motion.div
                initial={{ opacity: 0, x: 80, y: 30, rotate: 15, scale: 0.7 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="absolute right-3 sm:right-8 md:right-12 lg:right-36 bottom-16 sm:bottom-20 md:bottom-24 w-28 sm:w-44 md:w-56 lg:w-64 pointer-events-none z-10 hidden sm:block"
            >
                <motion.div
                    animate={{
                        y: [0, 15, 0, -15, 0],
                        rotate: [0, 5, 0, -5, 0],
                        scale: [1, 0.98, 1, 1.02, 1],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src="/images/buku.svg"
                        alt="Dekorasi Buku"
                        className="w-full h-auto drop-shadow-sm select-none"
                    />
                </motion.div>
            </motion.div>

            {/* ================= MAIN HERO CONTENT ================= */}
            <div className="max-w-4xl mx-auto px-6 w-full relative z-20 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="flex flex-col items-center justify-center text-center"
                >
                    {/* Main Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        className="font-['Poppins'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.12] tracking-tight mb-6 text-slate-900"
                    >
                        Ruang Bertumbuh<br />
                        untuk <span className="text-[#1b5e20]">Pejuang</span><br />
                        <span className="text-[#1b5e20]">Kampus Impian.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-normal"
                    >
                        Platform untuk tumbuh, berbagi, dan berkolaborasi bersama demi mewujudkan Indonesia yang lebih cerdas dan berdampak.
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-center">
                        <Link
                            href={dashboardRoute}
                            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#1b5e20] text-white font-bold text-base hover:bg-[#144718] hover:shadow-[0_10px_25px_rgba(27,94,32,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-md"
                        >
                            {auth.user ? 'Buka E-Learning' : 'Masuk ke Sistem'}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>

                        <a href="#faq">
                            <TertiaryButton>
                                Telusuri Tumbuh Berbagi
                            </TertiaryButton>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}


