import React from 'react';
import { Link } from '@inertiajs/react';

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
    { icon: TwitterIcon,   href: '#' },
    { icon: LinkedInIcon,  href: '#' },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center">
                            <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-10 w-auto" />
                        </div>
                        <p className="text-slate-500 font-light text-sm sm:text-base leading-relaxed max-w-md">
                            Program beasiswa mentoring eksklusif untuk pejuang UTBK/SNBT, mempersiapkan generasi cerdas menuju Perguruan Tinggi Negeri impian.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map(({ icon: Icon, href }, i) => (
                                <a key={i} href={href} className="w-10 h-10 rounded-full bg-[#f8fafc] border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#1b5e20] hover:bg-emerald-50 hover:border-[#1b5e20]/20 transition-all duration-300">
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-6 font-['Poppins']">Tautan Utama</h4>
                        <ul className="space-y-4 text-sm font-light text-slate-500">
                            <li><a href="#tentang" className="hover:text-[#1b5e20] transition-colors">Tentang Kami</a></li>
                            <li><a href="#kegiatan" className="hover:text-[#1b5e20] transition-colors">Informasi Kegiatan</a></li>
                            <li><a href="#faq" className="hover:text-[#1b5e20] transition-colors">Bantuan FAQ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-6 font-['Poppins']">Kontak Admin</h4>
                        <ul className="space-y-4 text-sm font-light text-slate-500">
                            <li>admin@tumbuhberbagi.id</li>
                            <li>+62 812 3456 7890</li>
                            <li>Senin - Jumat, 09:00 - 17:00 WIB</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-400 font-light">
                    <p>© {new Date().getFullYear()} Tumbuh Berbagi. Hak Cipta Dilindungi.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
