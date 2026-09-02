import React from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar({ scrolled, isMenuOpen, setIsMenuOpen, auth, dashboardRoute }) {
    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'top-4 px-4 sm:px-6 md:px-8' : 'top-0 py-5'}`}>
            <div className={`max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center transition-all duration-500 ${scrolled
                ? 'bg-white/85 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] py-3 rounded-full'
                : 'bg-transparent py-2 border-b border-transparent'
            }`}>
                <Link href="/" className="flex items-center group">
                    <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    {['kegiatan', 'fitur', 'tentang', 'faq'].map((section) => (
                        <a
                            key={section}
                            href={`#${section}`}
                            className="text-sm font-semibold text-slate-600 hover:text-[#d99b00] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#fcc526] hover:after:w-full after:transition-all after:duration-300"
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href={dashboardRoute}
                        className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold bg-[#1b5e20] text-white hover:bg-[#144718] hover:shadow-[0_4px_20px_rgba(27,94,32,0.3)] transition-all shadow-md active:scale-95"
                    >
                        {auth.user ? 'Buka E-Learning' : 'Masuk Akun'}
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 md:hidden text-slate-600 hover:text-[#d99b00] transition-colors focus:outline-none"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden mx-4 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-3xl overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-4">
                            {['kegiatan', 'fitur', 'tentang', 'faq'].map((section) => (
                                <a
                                    key={section}
                                    href={`#${section}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-base font-semibold text-slate-600 hover:text-[#d99b00] transition-colors py-2 border-b border-slate-50"
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1)}
                                </a>
                            ))}
                            <Link
                                href={dashboardRoute}
                                onClick={() => setIsMenuOpen(false)}
                                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-2xl text-sm font-bold bg-[#1b5e20] text-white hover:bg-[#144718] transition-all shadow-md mt-2"
                            >
                                {auth.user ? 'Buka E-Learning' : 'Masuk Akun'}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
