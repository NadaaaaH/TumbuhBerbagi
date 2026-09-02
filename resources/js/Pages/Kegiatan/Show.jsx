import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    ArrowRight,
    GraduationCap,
} from 'lucide-react';

export default function KegiatanShow({ auth, kegiatan }) {
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const dashboardRoute = auth?.user
        ? (auth?.role === 'admin' ? route('admin.dashboard') : route('dashboard'))
        : route('login');

    const formattedDate = useMemo(() => {
        if (!kegiatan.tanggal) return '-';
        return new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }, [kegiatan.tanggal]);

    const images = useMemo(() => {
        if (!kegiatan.gambar) return [];
        try {
            const trimmed = kegiatan.gambar.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map(img => img.startsWith('http') ? img : `/storage/${img}`);
                }
            }
        } catch (e) {}

        if (kegiatan.gambar.includes(',')) {
            return kegiatan.gambar.split(',').map(img =>
                img.trim().startsWith('http') ? img.trim() : `/storage/${img.trim()}`
            );
        }

        const fallbackUrl = kegiatan.gambar_url || `/storage/${kegiatan.gambar}`;
        return [fallbackUrl];
    }, [kegiatan]);

    return (
        <>
            <Head>
                <title>{kegiatan.nama_kegiatan} — Tumbuh Berbagi</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#fafafa] font-['Inter',sans-serif] text-slate-800">

                {/* ── Navbar (same style as Welcome.jsx) ── */}
                <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-white/80 backdrop-blur-sm py-4'}`}>
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                        <Link href="/" className="flex items-center group">
                            <img
                                src="/images/logo.png"
                                alt="Tumbuh Berbagi"
                                className="h-9 w-auto group-hover:scale-105 transition-transform"
                            />
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Kembali ke Beranda
                            </Link>

                            <Link
                                href={dashboardRoute}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[#1b5e20] text-white hover:bg-[#144718] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {auth?.user ? 'Buka E-Learning' : 'Masuk Akun'}
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ── Main Content ── */}
                <main className="pt-24 pb-20">
                    <div className="max-w-6xl mx-auto px-6 md:px-10">

                        {/* Back link — mobile only */}
                        <div className="sm:hidden mb-6">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <ArrowLeft size={15} />
                                Kembali
                            </Link>
                        </div>

                        {/* ── Split layout: image left, text right ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
                        >
                            {/* LEFT — Sticky image / carousel */}
                            <div className="lg:col-span-5 lg:sticky lg:top-28">
                                <div className="rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 bg-white aspect-[4/3] w-full relative">
                                    {images.length > 0 ? (
                                        images.length > 1 ? (
                                            <Swiper
                                                modules={[Autoplay, Pagination, Navigation]}
                                                spaceBetween={0}
                                                slidesPerView={1}
                                                loop={true}
                                                autoplay={{ delay: 3500, disableOnInteraction: false }}
                                                pagination={{ clickable: true }}
                                                navigation={true}
                                                className="w-full h-full"
                                            >
                                                {images.map((imgUrl, idx) => (
                                                    <SwiperSlide key={idx} className="w-full h-full">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${kegiatan.nama_kegiatan} - gambar ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        ) : (
                                            <img
                                                src={images[0]}
                                                alt={kegiatan.nama_kegiatan}
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                            <Calendar size={64} opacity={0.2} />
                                        </div>
                                    )}
                                </div>

                                {/* Date badge below image */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                                        <Calendar size={14} className="text-[#1b5e20]" />
                                        {formattedDate}
                                    </span>
                                    {(kegiatan.waktu_mulai || kegiatan.waktu_selesai) && (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                                            <Clock size={14} className="text-[#1b5e20]" />
                                            {kegiatan.waktu_mulai || '00:00'} – {kegiatan.waktu_selesai || 'Selesai'} WIB
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT — scrollable text */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Status badge */}
                                {kegiatan.status && (
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${kegiatan.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {kegiatan.status}
                                    </span>
                                )}

                                {/* Title */}
                                <h1 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                                    {kegiatan.nama_kegiatan}
                                </h1>

                                <div className="border-t border-slate-100" />

                                {/* Description */}
                                <div className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                                    {kegiatan.deskripsi || 'Tidak ada deskripsi untuk kegiatan ini.'}
                                </div>

                                {/* CTA for non-logged users */}
                                {!auth?.user && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#1b5e20]/5 to-[#508953]/10 border border-[#508953]/20"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#1b5e20] flex items-center justify-center text-white flex-shrink-0">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 mb-1">
                                                    Ikut Tumbuh Bersama Kami
                                                </p>
                                                <p className="text-sm text-slate-500 mb-4">
                                                    Login ke portal untuk mengakses latihan soal, jadwal mentoring, dan kegiatan eksklusif lainnya.
                                                </p>
                                                <Link
                                                    href={route('login')}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1b5e20] text-white text-sm font-semibold hover:bg-[#144718] transition-all shadow-md hover:-translate-y-0.5"
                                                >
                                                    Masuk ke E-Learning <ArrowRight size={15} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </main>

                {/* ── Simple footer ── */}
                <footer className="border-t border-emerald-800/40 bg-gradient-to-r from-[#1b5e20] to-[#144718] text-white py-8">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-emerald-100/80">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/95 px-2 py-1 rounded-lg inline-block">
                                <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-6 w-auto" />
                            </div>
                            <span>© {new Date().getFullYear()} Tumbuh Berbagi</span>
                        </div>
                        <Link href="/" className="hover:text-white transition-colors">
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
