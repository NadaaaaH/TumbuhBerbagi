import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { 
    Calendar, 
    Newspaper, 
    ArrowRight, 
    BookOpen, 
    Clock, 
    FileText, 
    CheckCircle2, 
    AlertCircle,
    CalendarDays,
    Sparkles,
    ChevronRight,
    Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, jadwalTerdekat, kegiatanTerbaru = [], latihanAktif = [] }) {
    // Animation variants for smooth elegant entry
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: 'spring', 
                stiffness: 100,
                damping: 15
            } 
        }
    };

    const formatIndonesianDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } catch (e) {
            return dateStr;
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); // Format HH:MM
    };

    const getUTBKTarget = () => {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            
            // We target May 3rd of the next upcoming UTBK.
            let targetYear = currentYear;
            let targetDate = new Date(`${targetYear}-05-03T00:00:00`);
            
            if (currentDate > targetDate) {
                targetYear = currentYear + 1;
                targetDate = new Date(`${targetYear}-05-03T00:00:00`);
            }
            
            const diffTime = targetDate - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
                year: targetYear,
                daysRemaining: diffDays > 0 ? diffDays : null
            };
        } catch (e) {
            return {
                year: 2027,
                daysRemaining: null
            };
        }
    };
    const utbkTarget = getUTBKTarget();

    const getDaysToEvent = (dateStr) => {
        if (!dateStr) return null;
        try {
            const eventDate = new Date(dateStr + 'T00:00:00');
            const currentDate = new Date();
            eventDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);
            const diffTime = eventDate - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (e) {
            return null;
        }
    };
    const daysToEvent = jadwalTerdekat ? getDaysToEvent(jadwalTerdekat.tanggal) : null;

    // Sort latihanAktif: sedang_dikerjakan -> tersedia (others) -> selesai
    const sortedLatihanAktif = React.useMemo(() => {
        if (!latihanAktif) return [];
        return [...latihanAktif].sort((a, b) => {
            const order = {
                'sedang_dikerjakan': 1,
                'tersedia': 2,
                'selesai': 3
            };
            const statusA = a.status === 'sedang_dikerjakan' ? 'sedang_dikerjakan' : (a.status === 'selesai' ? 'selesai' : 'tersedia');
            const statusB = b.status === 'sedang_dikerjakan' ? 'sedang_dikerjakan' : (b.status === 'selesai' ? 'selesai' : 'tersedia');
            return order[statusA] - order[statusB];
        });
    }, [latihanAktif]);

    return (
        <SiswaLayout
            user={auth.user}
            header="Beranda Siswa"
        >
            <Head title="Dashboard Siswa" />
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-11 pb-16"
            >
                <motion.div 
                    variants={itemVariants}
                    className="relative bg-gradient-to-br from-[#1b5e20] via-[#216c26] to-[#2e7d32] rounded-[2rem] p-8 md:p-10 text-white overflow-hidden group"
                >
                    {/* Floating fluid glow elements */}
                    <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="absolute left-1/4 top-0 -translate-y-1/2 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-extrabold font-['Poppins'] tracking-tight leading-tight">
                                Selamat datang kembali, {auth.user?.nama}! 👋
                            </h2>
                            <p className="text-emerald-50/80 text-sm md:text-base font-light leading-relaxed max-w-2xl">
                                Tetap fokus dan konsisten dalam belajar untuk beasiswa impian Anda. Pantau agenda terdekat, update berita terbaru, serta kerjakan paket latihan aktif di bawah ini.
                            </p>
                        </div>
                        <div className="shrink-0 pt-2 lg:pt-0">
                            <Link 
                                href={route('siswa.latihan.index')} 
                                className="bg-white text-[#1b5e20] px-7 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-50 hover:shadow-xl transition-all shadow-md active:scale-95 flex items-center gap-2 group/btn border border-emerald-100"
                            >
                                <BookOpen size={16} className="text-[#1b5e20] group-hover/btn:rotate-12 transition-transform" /> Mulai Belajar
                            </Link>
                        </div>
                    </div>
                </motion.div>
                {/* Main Grid: Schedule (Left 2/3) & UTBK Countdown (Right 1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    
                    {/* LEFT COLUMN: Jadwal Mentoring Terdekat (2/3 width) */}
                    <div className="lg:col-span-2 space-y-5 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                                <CalendarDays size={24} className="text-[#1b5e20]" />
                                <span>Jadwal Mentoring Terdekat</span>
                            </h3>
                            <Link 
                                href={route('siswa.jadwal')} 
                                className="text-xs font-bold text-[#1b5e20] hover:text-[#2e7d32] hover:underline flex items-center gap-1 transition-all"
                            >
                                Lihat Semua <ChevronRight size={14} />
                            </Link>
                        </div>

                        {jadwalTerdekat ? (
                            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-500 flex-1 flex flex-col justify-between">
                                {/* Side colored bar decoration */}
                                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#1b5e20] to-[#2e7d32]"></div>
                                
                                <div className="pl-4 flex flex-col md:flex-row justify-between md:items-center gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            {daysToEvent !== null && (
                                                <span className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100/60 shadow-sm animate-pulse">
                                                    {daysToEvent > 0 ? `H-${daysToEvent} (${daysToEvent} Hari Lagi)` : (daysToEvent === 0 ? 'Hari Ini 🚀' : 'Selesai')}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h4 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight leading-snug">
                                            {jadwalTerdekat.nama_jadwal}
                                        </h4>
                                        
                                        {/* Modern Round-Pill Badges */}
                                        <div className="flex flex-wrap gap-3">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-medium text-xs">
                                                <Calendar size={14} className="text-[#1b5e20]" />
                                                <span>{formatIndonesianDate(jadwalTerdekat.tanggal)}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-medium text-xs">
                                                <Clock size={14} className="text-[#1b5e20]" />
                                                <span>
                                                    {formatTime(jadwalTerdekat.waktu_mulai)} - {formatTime(jadwalTerdekat.waktu_selesai)} WIB
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="shrink-0 pt-2 md:pt-0">
                                        <Link 
                                            href={route('siswa.jadwal')}
                                            className="inline-flex items-center justify-center bg-[#1b5e20] hover:bg-[#144718] text-white px-6 py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 gap-2"
                                        >
                                            Atur Pengingat
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center py-16 flex-1">
                                <div className="p-4 bg-emerald-50/50 rounded-full text-slate-400 mb-4 border border-emerald-100/30">
                                    <Calendar size={32} className="text-[#1b5e20]" />
                                </div>
                                <h4 className="font-bold text-slate-700 text-base font-['Poppins']">Belum ada mentoring terdaftar</h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm leading-relaxed font-light">
                                    Saat ini tidak ada sesi mentoring aktif mendatang. Anda dapat memeriksa berkala atau menghubungi admin.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Hitung Mundur UTBK (1/3 width) */}
                    <div className="lg:col-span-1 h-full flex flex-col">
                        <div className="bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] border border-[#a5d6a7]/60 p-6 sm:p-8 rounded-[2rem] shadow-[0_4px_30_rgba(0,0,0,0.02)] relative overflow-hidden flex-1 flex flex-col justify-between min-h-[240px] group hover:shadow-md transition-all duration-500">
                            {/* Decorative background shape */}
                            <div className="absolute right-0 top-0 w-32 h-32 bg-[#a5d6a7]/30 rounded-full blur-2xl -z-10 translate-x-10 -translate-y-10 opacity-70"></div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#1b5e20]">
                                    <Clock size={18} />
                                    <span className="font-bold text-[11px] uppercase tracking-wider font-['Poppins']">Hitung Mundur UTBK</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[#1b5e20]/80 font-['Poppins']">
                                    UTBK SNBT {utbkTarget.year}
                                </h4>
                            </div>

                            <div className="flex items-baseline gap-2 my-4">
                                <span className="text-6xl font-extrabold text-[#1b5e20] font-['Poppins'] tracking-tight">
                                    {utbkTarget.daysRemaining !== null ? `${utbkTarget.daysRemaining}` : 'H-UTBK'}
                                </span>
                                {utbkTarget.daysRemaining !== null && (
                                    <span className="text-[#1b5e20]/80 font-bold text-sm">Hari Lagi</span>
                                )}
                            </div>

                            <div className="text-xs text-[#2e7d32]/90 font-medium leading-relaxed italic border-t border-[#a5d6a7]/30 pt-3">
                                "*Persiapan hari ini menentukan hasil hari esok. Tetap fokus dan konsisten belajar untuk impian Anda!"
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Latihan Soal Aktif (Full Width) */}
                <motion.div variants={itemVariants} className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                            <BookOpen size={24} className="text-[#1b5e20]" />
                            <span>Latihan Soal Aktif</span>
                        </h3>
                        <Link 
                            href={route('siswa.latihan.index')} 
                            className="text-xs font-bold text-[#1b5e20] hover:text-[#2e7d32] hover:underline flex items-center gap-1 transition-all"
                        >
                            Lihat Semua Latihan <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedLatihanAktif.length > 0 ? (
                            sortedLatihanAktif.map((paket) => (
                                <div 
                                    key={paket.id_paket}
                                    className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[255px] relative overflow-hidden group"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center gap-2">
                                            {paket.status === 'selesai' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-wide">
                                                    <CheckCircle2 size={10} /> Selesai
                                                </span>
                                            ) : paket.status === 'sedang_dikerjakan' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 uppercase tracking-wide animate-pulse">
                                                    <AlertCircle size={10} /> Dikerjakan
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-[#1b5e20] text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">
                                                    Tersedia
                                                </span>
                                            )}

                                            {paket.status === 'selesai' && paket.nilai !== null && (
                                                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 bg-blue-50/50 px-3 py-1 rounded-xl border border-blue-100">
                                                    <Award size={12} /> Skor: {paket.nilai}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-extrabold text-[#1a2530] text-xl font-['Poppins'] line-clamp-1 group-hover:text-[#1b5e20] transition-colors">
                                            {paket.nama_paket}
                                        </h4>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-normal mt-1">
                                            {paket.deskripsi || 'Uji pemahaman Anda dengan paket latihan terarah ini.'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                                        <div className="flex items-center gap-3.5 text-xs sm:text-[13px] text-slate-600 font-semibold">
                                            <div className="flex items-center gap-1.5">
                                                <FileText size={15} className="text-[#1b5e20]/80" />
                                                <span>{paket.soal_count || 0} Soal</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={15} className="text-[#1b5e20]/80" />
                                                <span>{paket.waktu_ujian || 0} Menit</span>
                                            </div>
                                        </div>

                                        {paket.status === 'selesai' ? (
                                            <Link 
                                                href={route('siswa.latihan.hasil', paket.id_paket)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 transition-all group/link"
                                            >
                                                <span>Hasil</span> 
                                                <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                                            </Link>
                                        ) : paket.status === 'sedang_dikerjakan' ? (
                                            <Link 
                                                href={route('siswa.latihan.show', paket.id_paket)}
                                                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-amber-500/10 active:scale-95 transition-all inline-flex items-center justify-center whitespace-nowrap gap-1.5"
                                            >
                                                Lanjutkan
                                            </Link>
                                        ) : (
                                            <Link 
                                                href={route('siswa.latihan.show', paket.id_paket)}
                                                className="bg-[#1b5e20] hover:bg-[#2d7e32] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-emerald-700/10 active:scale-95 transition-all inline-flex items-center justify-center whitespace-nowrap gap-1.5"
                                            >
                                                Kerjakan
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-10 rounded-[2rem] border border-slate-100 shadow-[0_4px_30_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center py-16">
                                <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                                    <BookOpen size={24} className="text-[#1b5e20]" />
                                </div>
                                <h5 className="font-bold text-slate-700 text-sm">Tidak ada latihan soal aktif</h5>
                                <p className="text-xs text-slate-400 mt-2 font-light">Saat ini belum ada paket latihan yang dipublikasikan.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* BOTTOM SECTION: Informasi Kegiatan (Full Width, style matches Welcome page) */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                            <Newspaper size={24} className="text-[#1b5e20]" />
                            <span>Informasi Kegiatan</span>
                        </h3>
                        <Link 
                            href={route('siswa.kegiatan.index')} 
                            className="text-xs font-bold text-[#1b5e20] hover:text-[#2e7d32] hover:underline flex items-center gap-1 transition-all"
                        >
                            Lihat Semua <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {kegiatanTerbaru.length > 0 ? (
                            kegiatanTerbaru.map((kegiatan) => (
                                <Link 
                                    href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                    key={kegiatan.id_kegiatan}
                                    className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col md:flex-row hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group overflow-hidden block"
                                >
                                    {/* Full Image on Left (No padding/margin, edge-to-edge) */}
                                    <div className="w-full md:w-[380px] h-52 md:h-auto relative flex-shrink-0 bg-slate-50 overflow-hidden">
                                        {kegiatan.gambar_url ? (
                                            <img 
                                                src={kegiatan.gambar_url} 
                                                alt={kegiatan.nama_kegiatan}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#f8f9fa] text-slate-300">
                                                <CalendarDays size={48} className="text-[#1b5e20] opacity-30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Column (Padded next to the image) */}
                                    <div className="flex-1 flex flex-col justify-between p-6 sm:p-8">
                                        <div>
                                            {/* Pill Date Badge */}
                                            <div className="mb-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
                                                    <CalendarDays size={12} className="text-[#1b5e20]" />
                                                    {formatIndonesianDate(kegiatan.tanggal)}
                                                </span>
                                            </div>
                                            <h4 className="font-extrabold text-slate-800 text-lg md:text-xl line-clamp-2 group-hover:text-[#1b5e20] transition-colors font-['Poppins'] leading-tight">
                                                {kegiatan.nama_kegiatan}
                                            </h4>
                                            <p className="text-slate-400 font-light text-xs sm:text-sm line-clamp-3 leading-relaxed mt-2.5">
                                                {kegiatan.deskripsi ? kegiatan.deskripsi.replace(/<[^>]*>/g, '') : 'Lihat detail lengkap pengumuman kegiatan beasiswa.'}
                                            </p>
                                        </div>
                                        <div className="mt-6 md:mt-4">
                                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 hover:border-[#1b5e20]/30 transition-all group/btn shadow-sm active:scale-95">
                                                <span>Baca Selengkapnya</span>
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center py-16">
                                <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-3 border border-slate-100/60">
                                    <Newspaper size={24} className="text-[#1b5e20]/60" />
                                </div>
                                <h5 className="font-bold text-slate-700 text-sm">Tidak ada kegiatan terbaru</h5>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed font-light">Belum ada pengumuman kegiatan atau informasi terbaru.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </SiswaLayout>
    );
}
