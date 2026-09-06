import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);
const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);
const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
);

const socialLinks = [
    { icon: InstagramIcon, href: '#' },
    { icon: TwitterIcon, href: '#' },
    { icon: LinkedInIcon, href: '#' },
];

export default function Footer({ containerClassName = '' }) {
    return (
        <div className="relative mt-0">
            {/* Animated 3D Wave Top Border Divider */}
            <div className="relative w-full overflow-hidden leading-none z-10 -mb-1 pointer-events-none">
                <svg
                    className="relative block w-full h-14 sm:h-20 md:h-28 text-[#1b5e20]"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    {/* Layer 2: 3D Bevel Highlight Curve */}
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
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Layer 3: Main Top Wave Surface */}
                    <motion.path
                        fill="currentColor"
                        animate={{
                            d: [
                                "M0,32 C310,105 610,22 910,82 C1060,112 1155,58 1200,72 L1200,120 L0,120 Z",
                                "M0,45 C280,30 580,90 880,45 C1040,20 1140,75 1200,55 L1200,120 L0,120 Z",
                                "M0,32 C310,105 610,22 910,82 C1060,112 1155,58 1200,72 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </svg>
            </div>

            <footer className="bg-gradient-to-b from-[#1b5e20] to-[#124216] text-white pt-10 pb-10 relative z-20">
                <div className={`max-w-7xl mx-auto px-6 ${containerClassName}`}>
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        {/* Brand */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center relative h-16 mb-2">
                                <img
                                    src="/images/logo2.png"
                                    alt="Tumbuh Berbagi"
                                    className="absolute -top-15 h-20 w-auto drop-shadow-md"
                                />
                            </div>
                            <p className="text-emerald-100/80 font-light text-sm sm:text-base leading-relaxed max-w-md">
                                Program beasiswa mentoring eksklusif untuk pejuang UTBK/SNBT, mempersiapkan generasi cerdas menuju Perguruan Tinggi Negeri impian.
                            </p>
                            <div className="flex gap-3">
                                {socialLinks.map(({ icon: Icon, href }, i) => (
                                    <a key={i} href={href} className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-emerald-100 hover:text-[#1b5e20] hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <Icon />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-6 font-['Poppins']">Tautan Utama</h4>
                            <ul className="space-y-4 text-sm font-light text-emerald-100/80">
                                <li><a href="/#tentang" className="hover:text-white hover:translate-x-1 transition-all inline-block">Tentang Kami</a></li>
                                <li><a href="/#kegiatan" className="hover:text-white hover:translate-x-1 transition-all inline-block">Informasi Kegiatan</a></li>
                                <li><a href="/#faq" className="hover:text-white hover:translate-x-1 transition-all inline-block">Bantuan FAQ</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-6 font-['Poppins']">Kontak Admin</h4>
                            <ul className="space-y-4 text-sm font-light text-emerald-100/80">
                                <li>admin@tumbuhberbagi.id</li>
                                <li>+62 812 3456 7890</li>
                                <li>Senin - Jumat, 09:00 - 17:00 WIB</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-emerald-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-emerald-200/60 font-light">
                        <p>© {new Date().getFullYear()} Tumbuh Berbagi. Hak Cipta Dilindungi.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
                            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
