import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Calendar, Clock, MapPin, Bell, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index({ auth, jadwals, activeAlarms }) {
    const [alarms, setAlarms] = useState(activeAlarms || {});

    // Sort events by date ascending for the upcoming list
    const sortedJadwals = useMemo(() => {
        if (!jadwals) return [];
        return [...jadwals].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    }, [jadwals]);

    // Initial calendar month focus on the first event date, fallback to current date
    const initialDate = useMemo(() => {
        if (sortedJadwals.length > 0) {
            try {
                return new Date(sortedJadwals[0].tanggal);
            } catch (e) {
                return new Date();
            }
        }
        return new Date();
    }, [sortedJadwals]);

    const [calendarDate, setCalendarDate] = useState(initialDate);

    const formatDate = (date) => {
        if (!date) return '-';
        try {
            return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return date;
        }
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return String(time).slice(0, 5);
    };

    const formatEventDateTime = (tanggal, waktuMulai, waktuSelesai) => {
        try {
            const date = new Date(tanggal);
            const monthStr = date.toLocaleDateString('id-ID', { month: 'short' });
            const day = date.getDate();
            const year = date.getFullYear();
            const start = String(waktuMulai).slice(0, 5);
            const end = String(waktuSelesai).slice(0, 5);
            return `${day} ${monthStr} ${year} - ${start} - ${end}`;
        } catch (e) {
            return '';
        }
    };

    const toggleAlarm = (id) => {
        axios.post(route('siswa.jadwal.alarm', id))
            .then(response => {
                if (response.data.success) {
                    setAlarms(prev => ({
                        ...prev,
                        [id]: response.data.active
                    }));

                    Swal.fire({
                        title: response.data.active ? 'Alarm Diaktifkan! ⏰' : 'Alarm Dinonaktifkan 🔕',
                        text: response.data.message,
                        icon: response.data.active ? 'success' : 'info',
                        confirmButtonColor: '#1b5e20',
                        customClass: {
                            popup: 'rounded-[2rem] p-6 shadow-xl border border-slate-100',
                            confirmButton: 'rounded-2xl px-6 py-3 font-semibold text-sm'
                        }
                    });
                }
            })
            .catch(error => {
                console.error(error);
                Swal.fire({
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat mengatur alarm.',
                    icon: 'error',
                    confirmButtonColor: '#1b5e20',
                    customClass: {
                        popup: 'rounded-[2rem] p-6 shadow-xl border border-slate-100',
                        confirmButton: 'rounded-2xl px-6 py-3 font-semibold text-sm'
                    }
                });
            });
    };

    // Calendar Calculations
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth(); // 0-indexed

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const handlePrevMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const daysArray = [];

    // Fill prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        daysArray.push({
            day: prevMonthTotalDays - i,
            isCurrentMonth: false,
            dateObj: new Date(year, month - 1, prevMonthTotalDays - i)
        });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
        daysArray.push({
            day: i,
            isCurrentMonth: true,
            dateObj: new Date(year, month, i)
        });
    }

    // Fill next month days
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
        daysArray.push({
            day: i,
            isCurrentMonth: false,
            dateObj: new Date(year, month + 1, i)
        });
    }

    const getEventsForDate = (dateObj) => {
        if (!jadwals) return [];
        return jadwals.filter(jadwal => {
            try {
                const jDate = new Date(jadwal.tanggal);
                return jDate.getFullYear() === dateObj.getFullYear() &&
                       jDate.getMonth() === dateObj.getMonth() &&
                       jDate.getDate() === dateObj.getDate();
            } catch (e) {
                return false;
            }
        });
    };

    const dotColors = [
        'bg-[#1b5e20]',
        'bg-emerald-600',
        'bg-teal-600',
        'bg-green-600'
    ];

    const getEventColorClass = (idx) => {
        const colors = [
            'bg-emerald-100 text-emerald-800 border-emerald-200',
            'bg-green-50 text-[#1b5e20] border-green-200',
            'bg-teal-100 text-teal-800 border-teal-200'
        ];
        return colors[idx % colors.length];
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
    };

    return (
        <SiswaLayout user={auth.user} header="Jadwal Mentoring">
            <Head title="Jadwal Mentoring" />

            <div className="mb-8">
                <p className="text-slate-500 font-light leading-relaxed">
                    Berikut adalah jadwal mentoring dan pertemuan akademis Anda. Aktifkan pengingat email agar Anda mendapatkan notifikasi sebelum sesi dimulai.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: Upcoming Events list (4/12 width) */}
                <div className="xl:col-span-4 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Jadwal Mendatang</h2>
                        <p className="text-slate-400 text-xs font-semibold mt-1">Jangan lewatkan jadwal Anda</p>
                    </div>
                    
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar"
                    >
                        {sortedJadwals.length > 0 ? (
                            sortedJadwals.map((jadwal, idx) => (
                                <motion.div 
                                    variants={cardVariants}
                                    key={jadwal.id_jadwal}
                                    className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
                                >
                                    {/* Card Header: Green Gradient with Dynamic Event Title */}
                                    <div className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] px-5 py-3.5 text-white flex items-center justify-between">
                                        <h3 className="font-bold text-sm sm:text-base truncate pr-2">
                                            {jadwal.nama_jadwal || 'Jadwal Mentoring'}
                                        </h3>
                                        <Calendar size={18} className="opacity-90 shrink-0" />
                                    </div>
                                    
                                    {/* Card Body */}
                                    <div className="p-5 flex-1 flex flex-col space-y-3 text-slate-700">
                                        {/* Date */}
                                        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
                                            <Calendar size={16} className="text-[#1b5e20] shrink-0" />
                                            <span>{formatDate(jadwal.tanggal)}</span>
                                        </div>
                                        
                                        {/* Time */}
                                        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
                                            <Clock size={16} className="text-orange-500 shrink-0" />
                                            <span>{formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)} WIB</span>
                                        </div>
                                        
                                        {/* Location */}
                                        <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold">
                                            <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                            <span>{jadwal.lokasi || 'Online / Zoom'}</span>
                                        </div>

                                        {/* Actions (Stacked Vertically, Descriptive Labels) */}
                                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 mt-2">
                                            <button 
                                                onClick={() => toggleAlarm(jadwal.id_jadwal)}
                                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 border ${
                                                    alarms[jadwal.id_jadwal] 
                                                    ? 'bg-green-50 text-[#1b5e20] border-green-200' 
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                                                }`}
                                            >
                                                {alarms[jadwal.id_jadwal] ? (
                                                    <>
                                                        <CheckCircle2 size={14} className="animate-pulse text-[#1b5e20]" />
                                                        Pengingat Email Aktif
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bell size={14} />
                                                        Set Alarm ke Email
                                                    </>
                                                )}
                                            </button>
                                            <a 
                                                href={jadwal.google_calendar_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100/60 transition-all active:scale-95 shadow-sm"
                                            >
                                                <Calendar size={14} />
                                                Tambahkan ke Calendar
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center py-16 flex flex-col items-center justify-center">
                                <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                                    <Calendar size={24} className="text-[#1b5e20]" />
                                </div>
                                <h5 className="font-bold text-slate-700 text-sm">Belum Ada Jadwal</h5>
                                <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed max-w-xs">
                                    Saat ini belum ada jadwal mentoring mendatang.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Calendar view (8/12 width) */}
                <div className="xl:col-span-8">
                    <motion.div 
                        variants={cardVariants}
                        className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-6 md:p-8"
                    >
                        {/* Calendar Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold text-slate-800 capitalize">
                                    {monthNames[month]} {year}
                                </h3>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={handlePrevMonth}
                                        className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-1 transition-colors"
                                    >
                                        &lt;
                                    </button>
                                    <button 
                                        onClick={handleNextMonth}
                                        className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-1 transition-colors"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                            {/* Weekday headers */}
                            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((dayName, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-slate-50/80 py-3 text-center text-slate-500 font-bold text-xs"
                                >
                                    {dayName}
                                </div>
                            ))}
                            
                            {/* Grid days */}
                            {daysArray.map((cell, idx) => {
                                const isToday = new Date().toDateString() === cell.dateObj.toDateString();
                                const dateEvents = getEventsForDate(cell.dateObj);
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className={`bg-white min-h-[95px] p-2 flex flex-col justify-between group/cell hover:bg-slate-50/40 transition-colors ${
                                            cell.isCurrentMonth ? '' : 'bg-slate-50/30'
                                        }`}
                                    >
                                        {/* Day number */}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                                                isToday 
                                                ? 'bg-[#1b5e20] text-white shadow-sm' 
                                                : cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                                            }`}>
                                                {cell.day}
                                            </span>
                                        </div>
                                        
                                        {/* Events */}
                                        <div className="space-y-1 flex-1 flex flex-col justify-start">
                                            {dateEvents.map((evt, eIdx) => (
                                                <div 
                                                    key={evt.id_jadwal}
                                                    className={`text-[9px] p-1.5 rounded-lg border font-bold truncate leading-tight shadow-3xs transition-all hover:scale-102 ${getEventColorClass(eIdx)}`}
                                                    title={`${evt.nama_jadwal} (${formatTime(evt.waktu_mulai)} - ${formatTime(evt.waktu_selesai)})`}
                                                >
                                                    <div className="truncate font-extrabold">{evt.nama_jadwal}</div>
                                                    <div className="opacity-80 text-[8px] mt-0.5">{formatTime(evt.waktu_mulai)} - {formatTime(evt.waktu_selesai)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

            </div>
        </SiswaLayout>
    );
}
