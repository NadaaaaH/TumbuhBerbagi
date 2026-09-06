import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1b5e20] to-[#124216] pt-6 sm:pt-0 font-['Inter',sans-serif] relative overflow-hidden">
            {/* Subtle Background Lighting Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#329a39]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Floating Topi2 Decoration (Top-Left) */}
            <motion.div
                initial={{ opacity: 0, x: -60, y: -20, rotate: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="absolute left-6 sm:left-16 md:left-28 lg:left-40 top-4 sm:top-8 md:top-12 w-36 sm:w-60 md:w-72 lg:w-80 pointer-events-none z-10"
            >
                <motion.div
                    animate={{
                        y: [0, -14, 0, 14, 0],
                        rotate: [0, -3, 0, 3, 0],
                        scale: [1, 1.02, 1, 0.98, 1],
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src="/images/topi2.svg"
                        alt="Dekorasi Topi Toga"
                        className="w-full h-auto drop-shadow-md select-none"
                    />
                </motion.div>
            </motion.div>

            {/* Floating Buku2 Decoration (Bottom-Right) */}
            <motion.div
                initial={{ opacity: 0, x: 60, y: 20, rotate: 10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="absolute right-6 sm:right-16 md:right-28 lg:right-40 bottom-6 sm:bottom-10 md:bottom-14 w-24 sm:w-44 md:w-56 lg:w-64 pointer-events-none z-10"
            >
                <motion.div
                    animate={{
                        y: [0, 14, 0, -14, 0],
                        rotate: [0, 4, 0, -4, 0],
                        scale: [1, 0.98, 1, 1.02, 1],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src="/images/buku2.svg"
                        alt="Dekorasi Buku"
                        className="w-full h-auto drop-shadow-md select-none"
                    />
                </motion.div>
            </motion.div>

            {/* Form & Logo Stack (Shifted Upwards) */}
            <div className="flex flex-col items-center justify-center w-full px-4 relative z-20 -mt-10 sm:-mt-16">
                <div className="mb-6 relative z-20">
                    <Link href="/" className="group flex flex-col items-center gap-4">
                        <img src="/images/logo2.png" alt="Tumbuh Berbagi" className="h-20 sm:h-24 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
                    </Link>
                </div>

                <div className="w-full sm:max-w-md overflow-hidden bg-white/95 backdrop-blur-xl px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:rounded-[2.5rem] border border-white/20 relative z-20">
                    {children}
                </div>
            </div>
        </div>
    );
}
