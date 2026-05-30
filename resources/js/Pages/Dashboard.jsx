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

export default function Dashboard({ auth, jadwalTerdekat, kegiatanTerbaru, latihanAktif }) {
    // Animation variants for smooth elegant entry
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: 'spring', 
                stiffness: 120,
                damping: 14
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
                className="space-y-8 pb-16"
            >
                {/* Welcome Card Banner (Modern Fluid Gradient) */}
                <motion.div 
                    variants={itemVariants}
                    className="relative bg-gradient-to-r from-[#1b5e20] via-[#247329] to-[#388e3c] rounded-[24px] p-6 md:p-8 text-white shadow-md overflow-hidden group"
                >
                    {/* Floating fluid glow elements */}
                    <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="absolute left-1/4 top-0 -translate-y-1/2 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-3 max-w-3xl">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold backdrop-blur-md border border-white/10 tracking-wide">
                                <Sparkles size={12} className="animate-spin text-yellow-300" /> Panel Beasiswa Tumbuh Berbagi
                            </span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-['Poppins'] tracking-tight leading-tight">
                                Selamat datang kembali, {auth.user?.nama}! 👋
                            </h2>
                            <p className="text-emerald-50/90 text-sm md:text-base font-light leading-relaxed max-w-2xl">
                                Tetap fokus dan konsisten dalam belajar untuk beasiswa impian Anda. Pantau agenda terdekat, update berita terbaru, serta kerjakan paket latihan aktif di bawah ini.
                            </p>
                        </div>
                        <div className="shrink-0 pt-2 lg:pt-0">
                            <Link 
                                href={route('siswa.latihan.index')} 
                                className="bg-white text-[#1b5e20] px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all shadow-lg active:scale-95 flex items-center gap-2 group/btn border border-emerald-100"
                            >
                                <BookOpen size={16} className="text-[#1b5e20] group-hover/btn:rotate-12 transition-transform" /> Mulai Latihan
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Main Grid: Schedule (Left 2/3) & Activities (Right 1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Jadwal Mentoring Terdekat (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-emerald-50 text-[#1b5e20]"><CalendarDays size={18} /></span>
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
                            <div className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-md transition-all duration-300">
                                {/* Side colored bar decoration */}
                                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#1b5e20] to-[#388e3c]"></div>
                                
                                <div className="pl-3 flex flex-col md:flex-row justify-between md:items-center gap-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                                Status: Aktif
                                            </span>
                                            <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                                Mentoring
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Poppins'] tracking-tight">
                                            {jadwalTerdekat.nama_jadwal}
                                        </h4>
                                        
                                        {/* Modern Round-Pill Badges */}
                                        <div className="flex flex-wrap gap-2.5">
                                            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 text-slate-600 font-medium text-xs border border-slate-100/80">
                                                <Calendar size={14} className="text-[#1b5e20]" />
                                                <span>{formatIndonesianDate(jadwalTerdekat.tanggal)}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 text-slate-600 font-medium text-xs border border-slate-100/80">
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
                                            className="inline-flex items-center justify-center bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] hover:from-[#2e7d32] hover:to-[#388e3c] text-white px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-sm hover:shadow-md active:scale-95 gap-2"
                                        >
                                            Atur Pengingat
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-3xl border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] text-center flex flex-col items-center justify-center py-12">
                                <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-3 border border-slate-100/60">
                                    <Calendar size={28} className="text-[#1b5e20]/60" />
                                </div>
                                <h4 className="font-bold text-slate-700 text-base font-['Poppins']">Belum ada mentoring terdaftar</h4>
                                <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                                    Saat ini tidak ada sesi mentoring aktif mendatang. Anda dapat memeriksa berkala atau menghubungi admin.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Kegiatan & Info Feed (1/3 width) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-emerald-50 text-[#1b5e20]"><Newspaper size={18} /></span>
                                <span>Kegiatan & Informasi</span>
                            </h3>
                            <Link 
                                href={route('siswa.kegiatan.index')} 
                                className="text-xs font-bold text-[#1b5e20] hover:text-[#2e7d32] hover:underline flex items-center gap-1 transition-all"
                            >
                                Lihat Semua <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {kegiatanTerbaru.length > 0 ? (
                                kegiatanTerbaru.map((kegiatan) => (
                                    <Link 
                                        href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                        key={kegiatan.id_kegiatan}
                                        className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-4 flex gap-4 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 block"
                                    >
                                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 relative">
                                            {kegiatan.gambar_url ? (
                                                <img 
                                                    src={kegiatan.gambar_url} 
                                                    alt={kegiatan.nama_kegiatan}
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-emerald-50 text-[#1b5e20] flex items-center justify-center font-bold text-xl font-['Poppins']">
                                                    {kegiatan.nama_kegiatan.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <span className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20]/60"></span>
                                                {formatIndonesianDate(kegiatan.tanggal)}
                                            </span>
                                            <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1 group-hover:text-[#1b5e20] transition-colors font-['Poppins']">
                                                {kegiatan.nama_kegiatan}
                                            </h4>
                                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                                                {kegiatan.deskripsi ? kegiatan.deskripsi.replace(/<[^>]*>/g, '') : 'Lihat detail lengkap pengumuman kegiatan beasiswa.'}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] text-center flex flex-col items-center justify-center py-12">
                                    <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-2 border border-slate-100/60">
                                        <Newspaper size={24} className="text-[#1b5e20]/60" />
                                    </div>
                                    <h5 className="font-bold text-slate-700 text-sm">Tidak ada kegiatan terbaru</h5>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">Belum ada pengumuman kegiatan atau informasi terbaru.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Latihan Soal Aktif (Full Width) */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-50 text-[#1b5e20]"><BookOpen size={18} /></span>
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
                        {latihanAktif.length > 0 ? (
                            latihanAktif.map((paket) => (
                                <div 
                                    key={paket.id_paket}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[230px] relative overflow-hidden group"
                                >
                                    <div className="space-y-3.5">
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
                                                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-xl border border-blue-100">
                                                    <Award size={12} /> Skor: {paket.nilai}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-extrabold text-slate-800 text-lg font-['Poppins'] line-clamp-1 group-hover:text-[#1b5e20] transition-colors">
                                            {paket.nama_paket}
                                        </h4>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            {paket.deskripsi || 'Uji pemahaman Anda dengan paket latihan terarah ini.'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2 mt-2">
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                                            <div className="flex items-center gap-1">
                                                <FileText size={13} className="text-slate-400" />
                                                <span>{paket.soal_count || 0} Soal</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={13} className="text-slate-400" />
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
                                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm hover:shadow-amber-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                                            >
                                                Lanjutkan
                                            </Link>
                                        ) : (
                                            <Link 
                                                href={route('siswa.latihan.show', paket.id_paket)}
                                                className="bg-[#1b5e20] hover:bg-[#2d7e32] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm hover:shadow-emerald-700/10 active:scale-95 transition-all flex items-center gap-1.5"
                                            >
                                                Kerjakan
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] text-center flex flex-col items-center justify-center py-10">
                                <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-2">
                                    <BookOpen size={24} />
                                </div>
                                <h5 className="font-bold text-slate-700 text-sm">Tidak ada latihan soal aktif</h5>
                                <p className="text-xs text-slate-400 mt-1.5">Saat ini belum ada paket latihan yang dipublikasikan.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </SiswaLayout>
    );
}
