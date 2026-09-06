import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Calendar, Clock, MapPin, Bell, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';
import ContainerWhite from '@/Components/ContainerWhite';
import SecondIcon from '@/Components/SecondIcon';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomScrollbar from '@/Components/CustomScrollbar';

export default function Index({ auth, jadwals, activeAlarms }) {
    const [alarms, setAlarms] = useState(activeAlarms || {});

    const isPastEvent = (tanggal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(tanggal) < today;
    };

    // Sort events: acara mendatang yang paling terdekat di paling atas (ascending), yang sudah lewat di bawah
    const sortedJadwals = useMemo(() => {
        if (!jadwals) return [];

        const getFullDate = (j) => {
            try {
                const timeStr = j.waktu_mulai ? String(j.waktu_mulai).slice(0, 5) : '00:00';
                const dateStr = String(j.tanggal).slice(0, 10);
                return new Date(`${dateStr}T${timeStr}`);
            } catch (e) {
                return new Date(j.tanggal);
            }
        };

        return [...jadwals].sort((a, b) => {
            const dateA = getFullDate(a);
            const dateB = getFullDate(b);
            const isPastA = isPastEvent(a.tanggal);
            const isPastB = isPastEvent(b.tanggal);

            // Jika salah satu sudah lewat, yang masih mendatang didahulukan di atas
            if (!isPastA && isPastB) return -1;
            if (isPastA && !isPastB) return 1;

            // Jika keduanya mendatang: urutkan dari yang paling dekat (tercepat/ascending)
            if (!isPastA && !isPastB) {
                return dateA - dateB;
            }

            // Jika keduanya sudah lewat: urutkan dari yang paling baru selesai
            return dateB - dateA;
        });
    }, [jadwals]);

    // Initial calendar month focus on the closest upcoming event date, fallback to current date
    const initialDate = useMemo(() => {
        const upcoming = sortedJadwals.find(j => !isPastEvent(j.tanggal));
        if (upcoming) {
            try {
                return new Date(upcoming.tanggal);
            } catch (e) {
                return new Date();
            }
        }
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

    const getEventColorClass = (idx, isPast = false) => {
        if (isPast) return 'bg-slate-200 text-slate-400 border-slate-300';
        return 'bg-[#fef8e7] text-yellow-900 border-amber-200';
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">

                {/* LEFT COLUMN: Upcoming Events list (4/12 width) */}
                <div className="xl:col-span-4 relative min-h-[500px] xl:min-h-0">
                    <div className="flex flex-col h-full xl:absolute xl:inset-0 w-full bg-[#1b5e20] rounded-[2.5rem] p-5 md:p-6 shadow-md">
                        <div className="flex-shrink-0 mb-6">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Jadwal Mendatang</h2>
                            <p className="text-green-100 text-xs font-semibold mt-1">Jangan lewatkan jadwal Anda</p>
                        </div>

                        <CustomScrollbar theme="light" className="flex-1 min-h-0 pr-2 pb-2">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                {sortedJadwals.length > 0 ? (
                                    sortedJadwals.map((jadwal, idx) => {
                                        const past = isPastEvent(jadwal.tanggal);
                                        return (
                                            <motion.div
                                                variants={cardVariants}
                                                key={jadwal.id_jadwal}
                                            >
                                                <ContainerWhite id={`jadwal-card-${jadwal.id_jadwal}`} className={`overflow-hidden !p-0 flex flex-col scroll-mt-4 ${past ? 'opacity-60 grayscale' : ''}`}>
                                                    {/* Badge Sudah Lewat */}
                                                    {past && (
                                                        <div className="absolute top-2 right-2 z-10 bg-slate-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Sudah Lewat</div>
                                                    )}
                                                    {/* Card Banner: gambar dari admin (fixed height), atau header teks saja */}
                                                    {jadwal.gambar ? (
                                                        <div className="relative w-full h-32 overflow-hidden rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
                                                            <img
                                                                src={`/storage/${jadwal.gambar}`}
                                                                alt={jadwal.nama_jadwal}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {/* Overlay judul di atas gambar */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end px-4 pb-3">
                                                                <h3 className="font-bold text-sm sm:text-base text-white drop-shadow truncate pr-2 leading-tight">
                                                                    {jadwal.nama_jadwal || 'Jadwal Mentoring'}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gradient-to-br px-4 py-3 rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
                                                            <h3 className="font-bold text-sm sm:text-base text-black leading-snug mt-2 mb-0">
                                                                {jadwal.nama_jadwal || 'Jadwal Mentoring'}
                                                            </h3>
                                                        </div>
                                                    )}

                                                    {/* Card Body */}
                                                    <div className="p-5 flex-1 flex flex-col space-y-3 text-slate-700">

                                                        {/* Deskripsi */}
                                                        {jadwal.deskripsi && (
                                                            <p className="text-xs text-slate-500 leading-relaxed pb-1">
                                                                {jadwal.deskripsi}
                                                            </p>
                                                        )}

                                                        {/* Date */}
                                                        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-slate-600">
                                                            <SecondIcon icon={Calendar} iconSize={14} className="w-6 h-6 rounded-lg" />
                                                            <span>{formatDate(jadwal.tanggal)}</span>
                                                        </div>

                                                        {/* Time */}
                                                        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-slate-600">
                                                            <SecondIcon icon={Clock} iconSize={14} className="w-6 h-6 rounded-lg" />
                                                            <span>{formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)} WIB</span>
                                                        </div>

                                                        {/* Location */}
                                                        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-slate-600">
                                                            <SecondIcon icon={MapPin} iconSize={14} className="w-6 h-6 rounded-lg" />
                                                            <span>{jadwal.lokasi || 'Online / Zoom'}</span>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 mt-2">
                                                            <button
                                                                onClick={() => toggleAlarm(jadwal.id_jadwal)}
                                                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 border ${alarms[jadwal.id_jadwal]
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
                                                            <SecondaryButton
                                                                as="a"
                                                                href={jadwal.google_calendar_url || '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full text-xs py-2.5 px-4 rounded-xl font-bold gap-2"
                                                            >
                                                                <Calendar size={14} />
                                                                Tambahkan ke Calendar
                                                            </SecondaryButton>
                                                        </div>
                                                    </div>
                                                </ContainerWhite>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <ContainerWhite className="text-center py-12 flex flex-col items-center justify-center">
                                        <SecondIcon icon={Calendar} iconSize={24} className="mb-3" />
                                        <h5 className="font-bold text-slate-700 text-sm">Belum Ada Jadwal</h5>
                                        <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed max-w-xs">
                                            Saat ini belum ada jadwal mentoring mendatang.
                                        </p>
                                    </ContainerWhite>
                                )}
                            </motion.div>
                        </CustomScrollbar>
                    </div>
                </div>

                {/* RIGHT COLUMN: Calendar view (8/12 width) */}
                <div className="xl:col-span-8">
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="show"
                        className="h-full"
                    >
                        <ContainerWhite className="!rounded-[2.5rem] !p-6 md:!p-8 h-full">
                            {/* Calendar Controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-48 shrink-0">
                                        <h3 className="text-2xl font-bold text-slate-800 capitalize whitespace-nowrap">
                                            {monthNames[month]} {year}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handlePrevMonth}
                                            className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-1 transition-colors"
                                            aria-label="Bulan sebelumnya"
                                        >
                                            &lt;
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextMonth}
                                            className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-1 transition-colors"
                                            aria-label="Bulan selanjutnya"
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 bg-white rounded-2xl overflow-hidden border-t border-l border-[#1b5e20]">
                                {/* Weekday headers */}
                                {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((dayName, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-[#1b5e20] py-3 text-center text-white font-bold text-xs border-r border-b border-[#1b5e20]"
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
                                            className={`bg-white min-h-[95px] p-2 flex flex-col justify-between group/cell hover:bg-slate-100 transition-colors border-r border-b border-[#1b5e20] ${cell.isCurrentMonth ? '' : 'bg-slate-50'
                                                }`}
                                        >
                                            {/* Day number */}
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${isToday
                                                    ? 'bg-[#1b5e20] text-white shadow-sm'
                                                    : cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                                                    }`}>
                                                    {cell.day}
                                                </span>
                                            </div>

                                            {/* Events */}
                                            <div className="space-y-1 flex-1 flex flex-col justify-start">
                                                {dateEvents.map((evt, eIdx) => {
                                                    const evtPast = isPastEvent(evt.tanggal);
                                                    return (
                                                        <div
                                                            key={evt.id_jadwal}
                                                            onClick={() => {
                                                                const el = document.getElementById(`jadwal-card-${evt.id_jadwal}`);
                                                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            }}
                                                            className={`text-[9px] p-1.5 rounded-lg border font-bold leading-tight shadow-sm transition-all duration-200 cursor-pointer
                                                            ${evtPast ? '' : 'hover:scale-105 hover:!bg-[#fcc526] hover:!text-yellow-900 hover:!border-yellow-400 hover:shadow-md'} hover:z-10 relative
                                                            ${getEventColorClass(eIdx, evtPast)}`}
                                                            title={`${evt.nama_jadwal} (${formatTime(evt.waktu_mulai)} - ${formatTime(evt.waktu_selesai)})`}
                                                        >
                                                            <div className="font-extrabold truncate">{evt.nama_jadwal}</div>
                                                            <div className="opacity-80 text-[8px] mt-0.5">{formatTime(evt.waktu_mulai)} - {formatTime(evt.waktu_selesai)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ContainerWhite>
                    </motion.div>
                </div>

            </div>
        </SiswaLayout>
    );
}
