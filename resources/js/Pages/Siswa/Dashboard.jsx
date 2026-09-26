import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import ContainerGreen from '@/Components/ContainerGreen';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import FirstIcon from '@/Components/FirstIcon';
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
    skorTerbesarTO = null,
    riwayatDikerjakan = [],
    statistikNilaiTO = []
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

    // Tampilkan jumlah latihan aktif dinamis menyesuaikan tinggi kolom jadwal (1 baris / 2 card jika tidak ada jadwal terdekat, 2 baris / 4 card jika ada jadwal)
    const displayedLatihan = useMemo(() => {
        const hasJadwal = Boolean(jadwalTerdekat && (jadwalTerdekat.id_jadwal || jadwalTerdekat.nama_jadwal));
        const limit = hasJadwal ? 4 : 2;
        return latihanAktif.slice(0, limit);
    }, [latihanAktif, jadwalTerdekat]);

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
                    <div className="lg:col-span-4 space-y-6 flex flex-col order-last lg:order-first">
                        {/* Mini Calendar Card */}
                        <ContainerWhite className="relative overflow-hidden">
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
                                    const isPast = isPastEvent(dayObj.dateObj);

                                    // Determine circle style
                                    let circleClass = '';
                                    let textClass = '';

                                    if (hasEvent && isCurrentDay) {
                                        // Today + event: solid yellow
                                        circleClass = 'bg-[#fcc526] shadow-md';
                                        textClass = 'text-slate-900 font-black';
                                    } else if (isCurrentDay) {
                                        // Today no event: yellow outline ring
                                        circleClass = 'ring-2 ring-[#fcc526]';
                                        textClass = 'text-slate-800 font-black';
                                    } else if (hasEvent && isPast) {
                                        // Past event: gray filled
                                        circleClass = 'bg-slate-200';
                                        textClass = 'text-slate-600 font-bold';
                                    } else if (hasEvent) {
                                        // Upcoming event: solid yellow
                                        circleClass = 'bg-[#fcc526] shadow-sm';
                                        textClass = 'text-slate-900 font-black';
                                    }

                                    const isOtherMonth = !dayObj.isCurrentMonth;

                                    return (
                                        <div key={index} className="aspect-square flex items-center justify-center p-0.5">
                                            <div
                                                className={`
                                                    w-full h-full flex items-center justify-center rounded-full text-xs
                                                    transition-all duration-300
                                                    ${circleClass}
                                                    ${textClass}
                                                    ${!circleClass ? (isOtherMonth ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100') : ''}
                                                    ${isOtherMonth && !hasEvent && !isCurrentDay ? 'opacity-50' : ''}
                                                `}
                                            >
                                                {dayObj.day}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ContainerWhite>

                        {/* Jadwal Terdekat (Small Card) */}
                        {jadwalTerdekat && (
                            <ContainerWhite className="flex flex-col gap-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base md:text-lg font-['Poppins'] line-clamp-1 mb-2">{jadwalTerdekat.nama_jadwal}</h4>
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
                                <Link href={route('siswa.jadwal')} className="block w-full">
                                    <SecondaryButton className="w-full justify-center py-2.5 text-xs">
                                        Lihat Selengkapnya
                                    </SecondaryButton>
                                </Link>
                            </ContainerWhite>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Indicators & Activity (8 columns wide on large screens) */}
                    <div className="lg:col-span-8 flex flex-col gap-8 order-first lg:order-last">

                        {/* Indicators (3 Cards) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* Tryout Dikerjakan */}
                            <ContainerGreen className="flex flex-col justify-between cursor-default">
                                <div className="flex items-center gap-3 mb-3">
                                    <FirstIcon
                                        icon={CheckCircle2}
                                        iconSize={18}
                                        className="!bg-[#fcc526] !text-slate-900 shadow-md group-hover:!bg-[#eab522] group-hover:!text-slate-950"
                                    />
                                    <p className="text-[15px] font-bold text-emerald-100/90 tracking-tight leading-snug">Tryout Dikerjakan</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-extrabold text-white font-['Poppins'] tracking-tight">{totalTryoutDikerjakan}</p>
                                </div>
                            </ContainerGreen>

                            {/* Latsol Dikerjakan */}
                            <ContainerGreen className="flex flex-col justify-between cursor-default">
                                <div className="flex items-center gap-3 mb-3">
                                    <FirstIcon
                                        icon={BookOpen}
                                        iconSize={18}
                                        className="!bg-[#fcc526] !text-slate-900 shadow-md group-hover:!bg-[#eab522] group-hover:!text-slate-950"
                                    />
                                    <p className="text-[15px] font-bold text-emerald-100/90 tracking-tight leading-snug">Latsol Dikerjakan</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-extrabold text-white font-['Poppins'] tracking-tight">{totalLatsolDikerjakan}</p>
                                </div>
                            </ContainerGreen>

                            {/* Skor Terbesar TO */}
                            <ContainerGreen className="flex flex-col justify-between cursor-default">
                                <div className="flex items-center gap-3 mb-3">
                                    <FirstIcon
                                        icon={Award}
                                        iconSize={18}
                                        className="!bg-[#fcc526] !text-slate-900 shadow-md group-hover:!bg-[#eab522] group-hover:!text-slate-950"
                                    />
                                    <p className="text-[15px] font-bold text-emerald-100/90 tracking-tight leading-snug">Skor Terbesar TO</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-extrabold text-white font-['Poppins'] tracking-tight">{skorTerbesarTO !== null ? skorTerbesarTO : '-'}</p>
                                </div>
                            </ContainerGreen>
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
                                {displayedLatihan.length > 0 ? (
                                    displayedLatihan.map((paket) => (
                                        <ContainerWhite
                                            key={paket.id_paket}
                                            className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[180px]"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                    <h4 className="font-bold text-slate-800 text-base md:text-lg font-['Poppins'] line-clamp-2">
                                                        {paket.nama_paket}
                                                    </h4>
                                                    
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {paket.status === 'sedang_dikerjakan' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-100 uppercase tracking-wide animate-pulse">
                                                                <AlertCircle size={10} /> Dikerjakan
                                                            </span>
                                                        )}
                                                        {paket.tipe === 'tryout' ? (
                                                            <span className="inline-flex px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100 uppercase tracking-wider">
                                                                Tryout
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100 uppercase tracking-wider">
                                                                Latsol
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3">
                                                    {paket.deskripsi ? paket.deskripsi.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim() : 'Tidak ada deskripsi.'}
                                                </p>

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

                                            <div className="mt-auto pt-5">
                                                <Link href={route('siswa.latihan.show', paket.id_paket)} className="block w-full">
                                                    <PrimaryButton className={`w-full justify-center py-2.5 ${paket.status === 'sedang_dikerjakan' ? '!bg-[#508953] hover:!bg-[#3d6b40] !border-[#508953] shadow-sm' : ''}`}>
                                                        {paket.status === 'sedang_dikerjakan' ? 'Lanjutkan' : 'Mulai Kerjakan'}
                                                    </PrimaryButton>
                                                </Link>
                                            </div>
                                        </ContainerWhite>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center flex flex-col items-center justify-center p-100">
                                        <CheckCircle2 size={32} className="text-[#1b5e20]/30 mb-3" />
                                        <h5 className="font-bold text-slate-700 text-sm">Semua Selesai!</h5>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">Tidak ada latihan soal atau tryout aktif yang belum dikerjakan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === SECTION: Statistik TO + Riwayat Dikerjakan === */}
                <ContainerGreen className="flex flex-col md:flex-row gap-6 cursor-default hover:translate-y-0">

                    {/* Kiri: Grafik Tren Nilai TO */}
                    <div className="flex flex-col md:w-1/2">
                        <div className="flex items-center gap-3 mb-4">
                            <FirstIcon
                                icon={Award}
                                iconSize={18}
                                className="!bg-[#fcc526] !text-slate-900 shadow-md group-hover:!bg-[#eab522] group-hover:!text-slate-950"
                            />
                            <div>
                                <p className="text-[15px] font-bold text-white leading-none">Tren Nilai Tryout</p>
                                <p className="text-[11px] text-emerald-100/80 mt-1">Perkembangan skor TO kamu</p>
                            </div>
                        </div>

                        {statistikNilaiTO.length >= 2 ? (() => {
                            const vals = statistikNilaiTO.map(d => d.nilai);
                            const minVal = Math.min(...vals);
                            const maxVal = Math.max(...vals);
                            const range = maxVal - minVal || 1;
                            const W = 100; const H = 100; const pad = 4;
                            const pts = vals.map((v, i) => ({
                                x: pad + (i / (vals.length - 1)) * (W - pad * 2),
                                y: H - pad - ((v - minVal) / range) * (H - pad * 2),
                                label: statistikNilaiTO[i].tanggal,
                            }));
                            const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
                            const areaPath = `M${pts[0].x},${H} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length - 1].x},${H} Z`;
                            return (
                                <div className="w-full">
                                    <div className="relative w-full h-28">
                                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="toGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#fcc526" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#fcc526" stopOpacity="0.05" />
                                                </linearGradient>
                                            </defs>
                                            <path d={areaPath} fill="url(#toGrad)" />
                                            <polyline points={polyline} fill="none" stroke="#fcc526" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                        </svg>
                                        {/* Titik dirender sebagai HTML div agar tidak lonjong saat di-stretch */}
                                        {pts.map((p, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-2.5 h-2.5 bg-[#fcc526] rounded-full border-2 border-[#1b5e20] shadow-sm"
                                                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-1 px-1">
                                        {pts.map((p, i) => <span key={i} className="text-[9px] text-emerald-100/70 font-medium">{p.label}</span>)}
                                    </div>
                                    <div className="flex justify-between mt-3">
                                        <div className="text-center"><p className="text-[10px] text-emerald-100/70">Terendah</p><p className="text-sm font-black text-white">{minVal}</p></div>
                                        <div className="text-center"><p className="text-[10px] text-emerald-100/70">Tertinggi</p><p className="text-sm font-black text-[#fcc526]">{maxVal}</p></div>
                                        <div className="text-center"><p className="text-[10px] text-emerald-100/70">Terakhir</p><p className="text-sm font-black text-white">{vals[vals.length - 1]}</p></div>
                                    </div>
                                </div>
                            );
                        })() : statistikNilaiTO.length === 1 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                                <p className="text-3xl font-black text-[#fcc526]">{statistikNilaiTO[0].nilai}</p>
                                <p className="text-xs text-emerald-100/80 mt-1">Skor TO pertama kamu</p>
                                <p className="text-[10px] text-emerald-100/60 mt-3">Kerjakan lebih banyak TO untuk melihat tren</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                                <Award size={32} className="text-white/30 mb-2" />
                                <p className="text-xs text-white/80 font-medium">Belum ada data tryout</p>
                                <p className="text-[10px] text-emerald-100/60 mt-1">Selesaikan tryout untuk melihat grafik tren</p>
                            </div>
                        )}
                    </div>

                    {/* Divider vertikal */}
                    <div className="hidden md:block w-px bg-white/15 self-stretch" />

                    {/* Kanan: Riwayat card langsung (Background Putih) */}
                    <div className="flex flex-col md:w-1/2 overflow-y-auto max-h-72 gap-2.5 pr-1">
                        {riwayatDikerjakan.length > 0 ? riwayatDikerjakan.map((item) => (
                            <div key={item.id_sesi} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white shadow-sm border border-emerald-50">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate leading-snug">{item.nama_paket}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.tipe === 'tryout'
                                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                            {item.tipe === 'tryout' ? 'Tryout' : 'Latsol'}
                                        </span>
                                        {item.nilai_akhir !== null && (
                                            <span className="text-[9px] text-slate-500 font-medium">Nilai: <span className="font-bold text-slate-800">{item.nilai_akhir}</span></span>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    href={item.tipe === 'tryout'
                                        ? route('siswa.tryout.hasil', item.id_paket)
                                        : route('siswa.latihan.hasil', item.id_paket)
                                    }
                                    className="flex-shrink-0"
                                >
                                    <PrimaryButton className="!px-3.5 !py-1.5 !text-[10px] whitespace-nowrap shadow-sm">
                                        Lihat Hasil
                                    </PrimaryButton>
                                </Link>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                                <CheckCircle2 size={28} className="text-white/30 mb-2" />
                                <p className="text-xs text-white/80 font-medium">Belum ada riwayat</p>
                                <p className="text-[10px] text-emerald-100/60 mt-1">Selesaikan latihan atau tryout pertama kamu</p>
                            </div>
                        )}
                    </div>

                </ContainerGreen>

                {/* Kegiatan Terbaru - Full Width */}
                <div className="space-y-4 pt-2">
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
                            kegiatanTerbaru.map((kegiatan, index) => (
                                <Link
                                    href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                    key={kegiatan.id_kegiatan}
                                    className={`bg-white rounded-[1.5rem] border border-slate-100/80 shadow-sm flex hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${index === 0 ? 'md:col-span-2 flex-col md:flex-row' : 'flex-col'}`}
                                >
                                    {/* Bagian Gambar */}
                                    <div className={`relative bg-slate-50 overflow-hidden shrink-0 ${index === 0 ? 'w-full md:w-[45%] h-48 md:h-auto' : 'w-full h-40'}`}>
                                        {kegiatan.gambar_url ? (
                                            <img
                                                src={kegiatan.gambar_url}
                                                alt={kegiatan.nama_kegiatan}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                <CalendarDays size={48} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Bagian Konten */}
                                    <div className={`flex-1 flex flex-col justify-between ${index === 0 ? 'p-6 md:p-8' : 'p-5'}`}>
                                        <div>
                                            {/* Tanggal */}
                                            <span className="inline-block text-xs font-semibold text-slate-400 mb-2">
                                                {formatIndonesianDate(kegiatan.tanggal)}
                                            </span>

                                            {/* Judul */}
                                            <h4 className={`font-bold text-[#1b5e20] group-hover:text-[#2e7d32] transition-colors leading-tight ${index === 0 ? 'text-2xl mb-3' : 'text-lg mb-2 line-clamp-2'}`}>
                                                {kegiatan.nama_kegiatan}
                                            </h4>

                                            {/* Deskripsi Singkat */}
                                            <p className={`text-slate-500 font-medium break-words ${index === 0 ? 'text-sm line-clamp-3 leading-relaxed mb-6' : 'text-xs line-clamp-2 leading-relaxed mb-4'}`}>
                                                {kegiatan.deskripsi ? kegiatan.deskripsi.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim() : ''}
                                            </p>
                                        </div>

                                        {/* Teks Baca Selengkapnya */}
                                        <div className={`font-bold text-[#1b5e20] group-hover:text-[#2e7d32] flex items-center gap-1 mt-auto ${index === 0 ? 'text-sm' : 'text-xs'}`}>
                                            Baca Selengkapnya <ChevronRight size={index === 0 ? 16 : 14} />
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

            </motion.div>
        </SiswaLayout>
    );
}
