import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import {
    BookOpen, Users, Calendar, TrendingUp, Bell, FileText,
    ChevronDown, ArrowRight,
    GraduationCap, LayoutDashboard, Menu, X,
    Clock, MapPin, ExternalLink
} from 'lucide-react';

export default function Welcome({ auth, kegiatans }) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);

    const dashboardRoute = auth.user
        ? (auth.role === 'admin' ? route('admin.dashboard') : route('dashboard'))
        : route('login');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const faqs = [
        {
            q: "Siapa saja yang bisa mengakses portal ini?",
            a: "Portal ini eksklusif untuk penerima beasiswa mentoring Tumbuh Berbagi. Akun akan dibuatkan oleh admin setelah proses seleksi selesai."
        },
        {
            q: "Bagaimana cara mendapatkan akun?",
            a: "Kamu harus mendaftar dan lolos seleksi program beasiswa Tumbuh Berbagi. Informasi pendaftaran bisa dilihat di media sosial resmi kami."
        },
        {
            q: "Fitur apa saja yang tersedia di dalam dashboard?",
            a: "Setelah login, kamu bisa mengakses latihan soal SNBT, menjadwalkan mentoring, memantau progress belajar, serta melihat pengumuman kegiatan terbaru."
        },
        {
            q: "Apakah saya bisa mengubah jadwal mentoring yang sudah dipilih?",
            a: "Bisa, kamu dapat mengajukan perubahan jadwal mentoring melalui dashboard maksimal 24 jam sebelum sesi dimulai."
        }
    ];

    return (
        <>
            <Head>
                <title>Tumbuh Berbagi - Portal Akademik</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#fafafa] text-slate-800 font-['Inter',sans-serif] selection:bg-[#508953] selection:text-white overflow-x-hidden">

                {/* Navbar */}
                <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                        <Link href="/" className="flex items-center group">
                            <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-10 w-auto group-hover:scale-105 transition-transform" />
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#kegiatan" className="text-sm font-medium text-slate-600 hover:text-[#1b5e20] transition-colors">
                                Kegiatan
                            </a>
                            <a href="#fitur" className="text-sm font-medium text-slate-600 hover:text-[#1b5e20] transition-colors">
                                Fitur
                            </a>
                            <a href="#tentang" className="text-sm font-medium text-slate-600 hover:text-[#1b5e20] transition-colors">
                                Tentang
                            </a>
                            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-[#1b5e20] transition-colors">
                                FAQ
                            </a>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Action Button */}
                            <Link
                                href={dashboardRoute}
                                className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#1b5e20] text-white hover:bg-[#144718] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {auth.user ? 'Buka E-Learning' : 'Masuk Akun'}
                            </Link>

                            {/* Mobile Hamburger Toggle */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 md:hidden text-slate-600 hover:text-[#1b5e20] transition-colors focus:outline-none"
                                aria-label="Toggle Menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Drawer/Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="md:hidden bg-white border-b border-slate-100 shadow-lg overflow-hidden"
                            >
                                <div className="px-6 py-4 flex flex-col gap-4">
                                    <a
                                        href="#kegiatan"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-base font-medium text-slate-600 hover:text-[#1b5e20] transition-colors py-2 border-b border-slate-50"
                                    >
                                        Kegiatan
                                    </a>
                                    <a
                                        href="#fitur"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-base font-medium text-slate-600 hover:text-[#1b5e20] transition-colors py-2 border-b border-slate-50"
                                    >
                                        Fitur
                                    </a>
                                    <a
                                        href="#tentang"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-base font-medium text-slate-600 hover:text-[#1b5e20] transition-colors py-2 border-b border-slate-50"
                                    >
                                        Tentang
                                    </a>
                                    <a
                                        href="#faq"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-base font-medium text-slate-600 hover:text-[#1b5e20] transition-colors py-2 border-b border-slate-50"
                                    >
                                        FAQ
                                    </a>
                                    <Link
                                        href={dashboardRoute}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full text-sm font-semibold bg-[#1b5e20] text-white hover:bg-[#144718] transition-all shadow-md mt-2"
                                    >
                                        {auth.user ? 'Buka E-Learning' : 'Masuk Akun'}
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Hero Section */}
                <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-16 overflow-hidden bg-[#f8f9fa]">
                    {/* Subtle bg */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f8f9fa] to-white"></div>

                    {/* === Full-width image + text container === */}
                    <div className="relative w-full">

                        {/* Image Columns Left + Right + Text Center — all in one row */}
                        <div className="relative flex items-start justify-between w-full min-h-[480px] lg:min-h-[560px]">

                            {/* ── LEFT GROUP: 2 columns ── */}
                            <div className="hidden lg:flex gap-3 pl-0 pt-4 flex-shrink-0">
                                {/* Col A */}
                                <div className="flex flex-col gap-3 mt-8">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.7 }}
                                        className="w-32 h-44 xl:w-40 xl:h-52 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
                                        className="w-32 h-36 xl:w-40 xl:h-44 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                                {/* Col B */}
                                <div className="flex flex-col gap-3">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
                                        className="w-36 h-52 xl:w-44 xl:h-64 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                                        className="w-36 h-40 xl:w-44 xl:h-48 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* ── CENTER TEXT ── */}
                            <div className="flex-1 flex flex-col items-center justify-center pt-10 pb-10 px-6 lg:px-12 min-h-[480px] lg:min-h-[560px]">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={staggerContainer}
                                    className="flex flex-col items-center text-center w-full max-w-2xl"
                                >
                                    <motion.h1 variants={fadeInUp}
                                        className="font-['Poppins'] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-5 text-slate-900">
                                        Ruang Bertumbuh untuk{' '}
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b5e20] to-[#508953]">
                                            Pejuang Kampus Impian.
                                        </span>
                                    </motion.h1>
                                    <motion.p variants={fadeInUp}
                                        className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl">
                                        Portal akademik khusus penerima beasiswa untuk mengakses latihan soal, mentoring, dan perkembangan belajarmu.
                                    </motion.p>
                                    <motion.div variants={fadeInUp}>
                                        <Link href={dashboardRoute}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 transition-all shadow-xl hover:-translate-y-1">
                                            {auth.user ? 'Buka E-Learning' : 'Masuk ke Sistem'} <ArrowRight size={16} />
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* ── RIGHT GROUP: 2 columns ── */}
                            <div className="hidden lg:flex gap-3 pr-0 pt-4 flex-shrink-0">
                                {/* Col C */}
                                <div className="flex flex-col gap-3">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
                                        className="w-36 h-52 xl:w-44 xl:h-64 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                                        className="w-36 h-40 xl:w-44 xl:h-48 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                                {/* Col D */}
                                <div className="flex flex-col gap-3 mt-8">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.7 }}
                                        className="w-32 h-44 xl:w-40 xl:h-52 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
                                        className="w-32 h-36 xl:w-40 xl:h-44 rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                                        <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Kegiatan Section (Moved Up) */}
                <section id="kegiatan" className="py-24 bg-white overflow-hidden relative border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Informasi Kegiatan</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">Berita dan aktivitas terbaru dari komunitas Tumbuh Berbagi.</p>
                        </motion.div>
                    </div>

                    <div className="w-full relative">
                        {kegiatans && kegiatans.length > 0 ? (
                            <>
                                <Swiper
                                    modules={[Navigation, Pagination, Autoplay]}
                                    spaceBetween={32}
                                    centeredSlides={true}
                                    loop={true}
                                    slidesPerView={1.2}
                                    breakpoints={{
                                        640: { slidesPerView: 1.5 },
                                        1024: { slidesPerView: 2.2 },
                                        1280: { slidesPerView: 2.8 }
                                    }}
                                    navigation={{
                                        prevEl: '.swiper-button-prev-custom',
                                        nextEl: '.swiper-button-next-custom',
                                    }}
                                    className="!pb-16 px-4 sm:px-0"
                                >
                                    {kegiatans.map((kegiatan) => (
                                        <SwiperSlide key={kegiatan.id_kegiatan}>
                                            {({ isActive }) => (
                                                <button
                                                    onClick={() => isActive && setSelectedKegiatan(kegiatan)}
                                                    className={`text-left w-full transition-all duration-500 mx-auto bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col group h-full ${isActive ? 'opacity-100 scale-100 shadow-2xl cursor-pointer' : 'opacity-40 scale-[0.85] blur-[2px] cursor-default'}`}
                                                >
                                                    <div className="h-64 sm:h-80 bg-slate-200 relative overflow-hidden">
                                                        {kegiatan.gambar_url ? (
                                                            <img src={kegiatan.gambar_url} alt={kegiatan.nama_kegiatan} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                                <Calendar size={48} opacity={0.2} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4">
                                                            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#1b5e20] shadow-sm">
                                                                {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-8 flex-1 flex flex-col">
                                                        <h3 className="font-semibold text-2xl text-slate-900 mb-3 group-hover:text-[#1b5e20] transition-colors">{kegiatan.nama_kegiatan}</h3>
                                                        <p className="text-slate-600 line-clamp-3 mb-6 flex-1 text-lg">
                                                            {kegiatan.deskripsi}
                                                        </p>
                                                        <div className="text-[#1b5e20] font-medium flex items-center gap-2 mt-auto">
                                                            Baca selengkapnya <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-2 sm:px-8 pointer-events-none z-10">
                                    <button className="swiper-button-prev-custom pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1b5e20] hover:text-white hover:border-[#1b5e20] transition-all transform hover:scale-110">
                                        <ArrowRight className="rotate-180" size={24} />
                                    </button>
                                    <button className="swiper-button-next-custom pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1b5e20] hover:text-white hover:border-[#1b5e20] transition-all transform hover:scale-110">
                                        <ArrowRight size={24} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 mx-auto max-w-4xl px-6">
                                <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 text-lg">Belum ada informasi kegiatan.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Fitur Sistem (Moved Down) */}
                <section id="fitur" className="py-24 bg-[#f8f9fa] relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="text-center max-w-2xl mx-auto mb-16"
                        >
                            <h2 className="font-['Poppins'] text-3xl font-bold text-slate-900 mb-4">Apa yang Tumbuh Berbagi Berikan?</h2>
                            <p className="text-slate-600">Fasilitas dan dukungan utama yang dirancang khusus untuk mengantarkanmu menuju PTN impian.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: Users, title: "Beasiswa Mentoring", desc: "Dapatkan bimbingan dan pendampingan eksklusif dari mentor mahasiswa berprestasi." },
                                { icon: BookOpen, title: "Latihan Soal", desc: "Akses berbagai paket soal persiapan ujian dan pembahasan komprehensif." },
                                { icon: TrendingUp, title: "Lingkungan Pembelajar yang Suportif", desc: "Bergabung dengan komunitas pejuang PTN yang saling memotivasi dan mendukung satu sama lain." },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } }
                                    }}
                                    className="group p-6 rounded-3xl bg-white border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#508953]/20 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 shadow-sm border border-slate-100 flex items-center justify-center text-[#1b5e20] mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#1b5e20] group-hover:text-white">
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="font-semibold text-xl text-slate-800 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tentang Tumbuh Berbagi */}
                <section id="tentang" className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="font-['Poppins'] text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                Misi Kami Mengantarkan <span className="text-[#1b5e20]">Langkahmu.</span>
                            </h2>
                            <p className="text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                                Tumbuh Berbagi bukan sekadar program beasiswa, melainkan komunitas supportif yang berfokus pada pendidikan dan pertumbuhan karakter. Kami hadir untuk membimbing siswa berpotensi meraih kampus impian mereka melalui mentoring intensif, akses fasilitas akademik, dan dukungan moral.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">500+</p>
                                    <p className="text-sm text-slate-500">Peserta Aktif</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">50+</p>
                                    <p className="text-sm text-slate-500">Mentor Ahli</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">3</p>
                                    <p className="text-sm text-slate-500">Tahun Berdiri</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[#1b5e20] mb-1">98%</p>
                                    <p className="text-sm text-slate-500">Alumni Lulus PTN</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="py-24 bg-slate-50">
                    <div className="max-w-3xl mx-auto px-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="text-center mb-12"
                        >
                            <h2 className="font-['Poppins'] text-3xl font-bold text-slate-900 mb-4">Pertanyaan Seputar Portal</h2>
                            <p className="text-slate-600">Jawaban untuk pertanyaan yang sering diajukan mengenai sistem akademik Tumbuh Berbagi.</p>
                        </motion.div>

                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-4 gap-12 mb-16">
                            <div className="md:col-span-2">
                                <div className="flex items-center mb-6">
                                    <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-10 w-auto" />
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                                    Program beasiswa mentoring eksklusif untuk pejuang UTBK/SNBT, mempersiapkan generasi cerdas menuju Perguruan Tinggi Negeri impian.
                                </p>
                                <div className="flex gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1b5e20] hover:bg-green-50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1b5e20] hover:bg-green-50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1b5e20] hover:bg-green-50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-4">Tautan</h4>
                                <ul className="space-y-3 text-sm text-slate-500">
                                    <li><a href="#" className="hover:text-[#1b5e20] transition-colors">Tentang Kami</a></li>
                                    <li><a href="#" className="hover:text-[#1b5e20] transition-colors">Kegiatan</a></li>
                                    <li><a href="#" className="hover:text-[#1b5e20] transition-colors">Bantuan FAQ</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-4">Kontak Admin</h4>
                                <ul className="space-y-3 text-sm text-slate-500">
                                    <li>admin@tumbuhberbagi.id</li>
                                    <li>+62 812 3456 7890</li>
                                    <li>Senin - Jumat, 09:00 - 17:00</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                            <p>© {new Date().getFullYear()} Tumbuh Berbagi. Hak Cipta Dilindungi.</p>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</a>
                                <a href="#" className="hover:text-slate-600 transition-colors">Syarat & Ketentuan</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── Kegiatan Detail Modal ── */}
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

// ── Kegiatan Modal Component ──
function KegiatanModal({ kegiatan, auth, onClose }) {
    const formattedDate = kegiatan.tanggal
        ? new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })
        : '-';

    // Close on Escape key
    React.useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        // Backdrop
        <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={onClose}
        >
            {/* Blurred overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

            {/* Modal Panel */}
            <motion.div
                key="modal-panel"
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    id="modal-close-btn"
                    className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>

                {/* Image */}
                <div className="w-full h-56 sm:h-72 bg-slate-100 rounded-t-[2rem] sm:rounded-t-[2rem] overflow-hidden relative flex-shrink-0">
                    {kegiatan.gambar_url ? (
                        <img
                            src={kegiatan.gambar_url}
                            alt={kegiatan.nama_kegiatan}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Calendar size={64} opacity={0.3} />
                        </div>
                    )}
                    {/* Date badge on image */}
                    <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#1b5e20] shadow-sm">
                            {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    {/* Status badge */}
                    {kegiatan.status && (
                        <div className="absolute top-4 right-14">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                kegiatan.status === 'aktif'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-slate-500/80 text-white'
                            }`}>
                                {kegiatan.status === 'aktif' ? 'Aktif' : kegiatan.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    {/* Meta row */}
                    <div className="flex flex-wrap gap-3 mb-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                            <Calendar size={12} className="text-[#1b5e20]" />
                            {formattedDate}
                        </span>
                        {(kegiatan.waktu_mulai || kegiatan.waktu_selesai) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                                <Clock size={12} className="text-[#1b5e20]" />
                                {kegiatan.waktu_mulai || '00:00'} – {kegiatan.waktu_selesai || 'Selesai'} WIB
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
                        {kegiatan.nama_kegiatan}
                    </h2>

                    <div className="w-12 h-1 rounded-full bg-[#1b5e20] mb-5" />

                    {/* Description */}
                    <div className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap mb-6">
                        {kegiatan.deskripsi || 'Tidak ada deskripsi untuk kegiatan ini.'}
                    </div>

                    {/* Link ke halaman lengkap */}
                    <a
                        href={`/kegiatan/${kegiatan.id_kegiatan}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#1b5e20] hover:underline mb-6"
                    >
                        <ExternalLink size={14} />
                        Lihat halaman kegiatan lengkap
                    </a>

                    {/* CTA for non-logged users */}
                    {!auth?.user && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2 p-5 rounded-2xl bg-gradient-to-br from-[#1b5e20]/5 to-[#508953]/10 border border-[#508953]/20"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-[#1b5e20] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                                    <GraduationCap size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 mb-1 text-sm">
                                        Ikut Tumbuh Bersama Kami
                                    </p>
                                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                                        Login ke portal untuk mengakses latihan soal, jadwal mentoring, dan kegiatan eksklusif lainnya.
                                    </p>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1b5e20] text-white text-sm font-semibold hover:bg-[#144718] transition-all shadow-md hover:-translate-y-0.5"
                                    >
                                        Masuk ke E-Learning <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Internal Component for FAQ
function FaqItem({ question, answer, index }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-[#508953]/30"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-6 text-left"
            >
                <span className="font-semibold text-slate-800">{question}</span>
                <ChevronDown className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={20} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 pt-0 text-slate-600 text-sm leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
