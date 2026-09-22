import React, { useState, useMemo } from 'react';
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
    Award,
    ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ 
    auth, 
    jadwals = [], 
    jadwalTerdekat, 
    kegiatanTerbaru = [], 
    latihanAktif = [],
    totalLatsolDikerjakan = 0,
    totalTryoutDikerjakan = 0,
    skorTerbesarTO = null
}) {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
    };

    // Format helpers
    const formatIndonesianDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    const getUTBKTarget = () => {
        try {
            const currentDate = new Date();
            const targetDate = new Date('2027-04-21T00:00:00');
            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const diffTime = targetDay - currentDay;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
                year: 2027,
                daysRemaining: diffDays > 0 ? diffDays : (diffDays === 0 ? 0 : null)
            };
        } catch (e) {
            return { year: 2027, daysRemaining: null };
        }
    };
    const utbkTarget = getUTBKTarget();

    // CALENDAR LOGIC
    const isPastEvent = (tanggal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(tanggal) < today;
    };
    const initialDate = useMemo(() => {
        if (!jadwals) return new Date();
        const upcoming = jadwals.find(j => !isPastEvent(j.tanggal));
        if (upcoming) {
            try { return new Date(upcoming.tanggal); } catch (e) { return new Date(); }
        }
        return new Date();
    }, [jadwals]);

    const [calendarDate, setCalendarDate] = useState(initialDate);

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const handlePrevMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const firstDayIndex = new Date(year, month, 1).getDay(); 
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const daysArray = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        daysArray.push({ day: prevMonthTotalDays - i, isCurrentMonth: false, dateObj: new Date(year, month - 1, prevMonthTotalDays - i) });
    }
    for (let i = 1; i <= totalDays; i++) {
        daysArray.push({ day: i, isCurrentMonth: true, dateObj: new Date(year, month, i) });
    }
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
        daysArray.push({ day: i, isCurrentMonth: false, dateObj: new Date(year, month + 1, i) });
    }

    const getEventsForDate = (dateObj) => {
        if (!jadwals) return [];
        return jadwals.filter(jadwal => {
            try {
                const jDate = new Date(jadwal.tanggal);
                return jDate.getFullYear() === dateObj.getFullYear() && jDate.getMonth() === dateObj.getMonth() && jDate.getDate() === dateObj.getDate();
            } catch (e) { return false; }
        });
    };

    const isToday = (dateObj) => {
        const today = new Date();
        return dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
    };

    return (
        <SiswaLayout user={auth.user} header="Beranda Siswa">
            <Head title="Dashboard Siswa" />
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-16">
                
                {/* HEADER */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-4xl font-extrabold font-['Poppins'] tracking-tight text-slate-800">
                            Selamat datang, <span className="text-[#1b5e20]">{auth.user?.nama}!</span>
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base font-medium">
                            Siap tembus UTBK ke PTN favorit?
                        </p>
                    </div>
                    {utbkTarget.daysRemaining !== null && (
                        <div className="flex flex-col sm:items-end text-left sm:text-right">
                            <p className="text-slate-500 font-medium text-sm mb-1">Hitung Mundur UTBK</p>
                            <div className="flex items-center gap-1.5 text-slate-800">
                                <span className="text-4xl text-[#1b5e20] md:text-5xl font-extrabold tracking-tighter tabular-nums leading-none">
                                    {utbkTarget.daysRemaining}
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Calendar & Small Event Card (4 columns wide on large screens) */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col">
                        {/* Mini Calendar Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-800 font-['Poppins']">
                                    {monthNames[month]} {year}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Days Header */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                                    <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {daysArray.map((dayObj, index) => {
                                    const events = getEventsForDate(dayObj.dateObj);
                                    const hasEvent = events.length > 0;
                                    const isCurrentDay = isToday(dayObj.dateObj);
                                    
                                    // Base styles
                                    let cellClass = "aspect-square flex items-center justify-center rounded-xl text-xs font-semibold relative transition-all duration-300 ";
                                    
                                    if (!dayObj.isCurrentMonth) {
                                        cellClass += "text-slate-300 ";
                                    } else {
                                        cellClass += "text-slate-700 ";
                                    }
                                    
                                    // Highlight if today
                                    if (isCurrentDay) {
                                        cellClass += "bg-[#fef8e7] text-yellow-800 ";
                                    } else {
                                        cellClass += "hover:bg-slate-50 ";
                                    }

                                    return (
                                        <div key={index} className={cellClass}>
                                            <span>{dayObj.day}</span>
                                            {hasEvent && (
                                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1b5e20]"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Jadwal Terdekat (Small Card) */}
                        {jadwalTerdekat && (
                            <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm font-['Poppins'] line-clamp-1 mb-1">{jadwalTerdekat.nama_jadwal}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-[#1b5e20]" />
                                            <span>{formatIndonesianDate(jadwalTerdekat.tanggal)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                        <Clock size={12} className="text-[#1b5e20]" />
                                        <span>{formatTime(jadwalTerdekat.waktu_mulai)} - {formatTime(jadwalTerdekat.waktu_selesai)} WIB</span>
                                    </div>
                                </div>
                                <Link 
                                    href={route('siswa.jadwal')} 
                                    className="w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                                >
                                    Lihat Selengkapnya
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    {/* RIGHT COLUMN: Indicators & Activity (8 columns wide on large screens) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Indicators (3 Cards) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* Tryout Dikerjakan */}
                            <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 group hover:shadow-md transition-shadow duration-300">
                                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-800 font-['Poppins'] leading-none mb-1">{totalTryoutDikerjakan}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tryout Dikerjakan</p>
                                </div>
                            </div>

                            {/* Latsol Dikerjakan */}
                            <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 group hover:shadow-md transition-shadow duration-300">
                                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-800 font-['Poppins'] leading-none mb-1">{totalLatsolDikerjakan}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latsol Dikerjakan</p>
                                </div>
                            </div>

                            {/* Skor Terbesar TO */}
                            <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 group hover:shadow-md transition-shadow duration-300">
                                <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-800 font-['Poppins'] leading-none mb-1">{skorTerbesarTO !== null ? skorTerbesarTO : '-'}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skor Terbesar TO</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity: Latihan Soal & Tryout Aktif */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                                    <FileText size={20} className="text-[#1b5e20]" />
                                    <span>Latihan & Tryout Aktif</span>
                                </h3>
                                <Link
                                    href={route('siswa.latihan.index')}
                                    className="text-[11px] font-bold text-[#1b5e20] hover:text-[#2e7d32] hover:underline flex items-center gap-1 transition-all"
                                >
                                    Lihat Semua <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {latihanAktif.length > 0 ? (
                                    latihanAktif.map((paket) => (
                                        <div
                                            key={paket.id_paket}
                                            className="bg-white p-5 rounded-[1.5rem] border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                                        >
                                            <div>
                                                <div className="flex justify-between items-center gap-2 mb-3">
                                                    {paket.tipe === 'tryout' ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100 uppercase tracking-wider">
                                                            Tryout
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100 uppercase tracking-wider">
                                                            Latihan Soal
                                                        </span>
                                                    )}
                                                    
                                                    {paket.status === 'sedang_dikerjakan' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-100 uppercase tracking-wide animate-pulse">
                                                            <AlertCircle size={10} /> Dikerjakan
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h4 className="font-bold text-slate-800 text-sm font-['Poppins'] line-clamp-2 group-hover:text-[#1b5e20] transition-colors mb-2">
                                                    {paket.nama_paket}
                                                </h4>
                                                
                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <FileText size={12} className="text-[#1b5e20]/70" />
                                                        <span>{paket.soal_count || 0} Soal</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} className="text-[#1b5e20]/70" />
                                                        <span>{paket.waktu_ujian || 0} mnt</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <Link
                                                    href={route('siswa.latihan.show', paket.id_paket)}
                                                    className={`w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                        paket.status === 'sedang_dikerjakan' 
                                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' 
                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20]'
                                                    }`}
                                                >
                                                    {paket.status === 'sedang_dikerjakan' ? 'Lanjutkan' : 'Mulai Kerjakan'}
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full bg-slate-50 p-8 rounded-[1.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                        <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
                                        <h5 className="font-bold text-slate-700 text-sm">Semua Selesai!</h5>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">Tidak ada latihan soal atau tryout aktif yang belum dikerjakan.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kegiatan Terbaru */}
                        <div className="space-y-4 pt-6 border-t border-slate-100 mt-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 font-['Poppins'] flex items-center gap-2">
                                    <Newspaper size={20} className="text-[#1b5e20]" />
                                    <span>Informasi Kegiatan</span>
                                </h3>
                                <Link
                                    href={route('siswa.kegiatan.index')}
                                    className="text-[11px] font-bold text-[#1b5e20] hover:text-[#2e7d32] hover:underline flex items-center gap-1 transition-all"
                                >
                                    Lihat Semua <ChevronRight size={14} />
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {kegiatanTerbaru.length > 0 ? (
                                    kegiatanTerbaru.map((kegiatan) => (
                                        <Link
                                            href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                            key={kegiatan.id_kegiatan}
                                            className="bg-white rounded-[1.5rem] border border-slate-100/80 shadow-sm flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                                        >
                                            <div className="w-full h-32 relative bg-slate-50 overflow-hidden">
                                                {kegiatan.gambar_url ? (
                                                    <img
                                                        src={kegiatan.gambar_url}
                                                        alt={kegiatan.nama_kegiatan}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                                        <CalendarDays size={32} className="text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <span className="inline-block text-[10px] font-bold text-[#1b5e20] mb-2">{formatIndonesianDate(kegiatan.tanggal)}</span>
                                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-[#1b5e20] transition-colors leading-tight">
                                                        {kegiatan.nama_kegiatan}
                                                    </h4>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full bg-white p-6 rounded-[1.5rem] border border-slate-100 text-center">
                                        <p className="text-xs text-slate-400 font-medium">Belum ada pengumuman kegiatan terbaru.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </motion.div>
        </SiswaLayout>
    );
}
