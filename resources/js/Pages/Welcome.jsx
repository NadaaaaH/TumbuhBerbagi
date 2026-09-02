import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';

import Navbar from './Welcome/Partials/Navbar';
import HeroSection from './Welcome/Partials/HeroSection';
import KegiatanSection from './Welcome/Partials/KegiatanSection';
import FiturSection from './Welcome/Partials/FiturSection';
import TentangSection from './Welcome/Partials/TentangSection';
import FaqSection from './Welcome/Partials/FaqSection';
import Footer from './Welcome/Partials/Footer';
import KegiatanModal from './Welcome/Partials/KegiatanModal';

export default function Welcome({ auth, kegiatans }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);

    const dashboardRoute = auth.user
        ? (auth.role === 'admin' ? route('admin.dashboard') : route('dashboard'))
        : route('login');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head>
                <title>Tumbuh Berbagi</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <div className="relative min-h-screen bg-[#fafbfc] text-[#2c3e50] font-['Inter',sans-serif] selection:bg-[#1b5e20] selection:text-white overflow-x-hidden">

                {/* Decorative Background Blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-20" />
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-green-50/40 rounded-full blur-3xl pointer-events-none -z-20" />
                <div className="absolute bottom-[20%] left-[-20%] w-[700px] h-[700px] bg-slate-100/50 rounded-full blur-3xl pointer-events-none -z-20" />

                <Navbar
                    scrolled={scrolled}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    auth={auth}
                    dashboardRoute={dashboardRoute}
                />

                <HeroSection auth={auth} dashboardRoute={dashboardRoute} />

                <KegiatanSection
                    kegiatans={kegiatans}
                    onSelectKegiatan={setSelectedKegiatan}
                />

                <FiturSection />

                <TentangSection />

                <FaqSection />

                <Footer />
            </div>

            {/* Kegiatan Detail Modal */}
            <AnimatePresence>
                {selectedKegiatan && (
                    <KegiatanModal
                        kegiatan={selectedKegiatan}
                        auth={auth}
                        onClose={() => setSelectedKegiatan(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
