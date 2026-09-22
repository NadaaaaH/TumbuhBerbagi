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
import SearchBar from '@/Components/SearchBar';

export default function Index({ auth, jadwals, activeAlarms }) {
    const [alarms, setAlarms] = useState(activeAlarms || {});
    const [searchQuery, setSearchQuery] = useState('');

    const isPastEvent = (tanggal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(tanggal) < today;
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        if (path.startsWith('/storage/')) return path;
        if (path.startsWith('storage/')) return `/${path}`;
        return `/storage/${path}`;
    };

    // Sort events: acara mendatang yang paling terdekat di paling atas (ascending), yang sudah lewat di bawah
    const sortedJadwals = useMemo(() => {
        if (!jadwals) return [];

        let filtered = jadwals;
        if (searchQuery) {
            filtered = filtered.filter(j =>
                j.nama_jadwal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                j.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const getFullDate = (j) => {
            try {
                const timeStr = j.waktu_mulai ? String(j.waktu_mulai).slice(0, 5) : '00:00';
                const dateStr = String(j.tanggal).slice(0, 10);
                return new Date(`${dateStr}T${timeStr}`);
            } catch (e) {
                return new Date(j.tanggal);
            }
        };

        return [...filtered].sort((a, b) => {
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
    }, [jadwals, searchQuery]);

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
                    <div className="flex flex-col h-full xl:absolute xl:inset-0 w-full p-2">
                        {/* Header Section */}
                        <div className="flex-shrink-0 mb-5">
                            <h2 className="text-2xl md:text-3xl font-extrabold font-['Poppins'] text-slate-800 tracking-tight">Jadwal Mendatang</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Jangan lewatkan jadwal Anda</p>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-shrink-0 mb-6">
                            <SearchBar
                                className="w-full"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Scrollable Cards */}
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

                                        // Menentukan styling berdasarkan status jadwal (past atau active)
                                        const colorTheme = past ? 'bg-slate-100 text-slate-500 opacity-60 grayscale' : 'bg-white text-slate-800';

                                        return (
                                            <motion.div
                                                variants={cardVariants}
                                                key={jadwal.id_jadwal}
                                            >
                                                <ContainerWhite id={`jadwal-card-${jadwal.id_jadwal}`} className={`!p-0 flex flex-col scroll-mt-4 overflow-hidden ${colorTheme}`}>

                                                    {/* Header Image (if exists) */}
                                                    {jadwal.gambar && (
                                                        <div className="w-full h-36 relative shrink-0">
                                                            <img
                                                                src={getImageUrl(jadwal.gambar)}
                                                                alt={jadwal.nama_jadwal}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="p-6 flex flex-col gap-4">
                                                        {/* Title & Desc */}
                                                        <div>
                                                            <h3 className="font-semibold text-xl leading-tight mb-2">
                                                                {jadwal.nama_jadwal || 'Jadwal Mentoring'}
                                                            </h3>
                                                            <p className="text-sm opacity-80 leading-relaxed line-clamp-2">
                                                                {jadwal.deskripsi || 'Sesi mentoring interaktif bersama mentor berpengalaman.'}
                                                            </p>
                                                        </div>

                                                        {/* Footer Info: Date & Mentors (or Actions) */}
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center gap-3">
                                                                {/* Dark Icon Container */}
                                                                <div className="bg-[#1b5e20] text-white w-10 h-10 rounded-[0.85rem] flex items-center justify-center shrink-0">
                                                                    <Calendar size={18} />
                                                                </div>
                                                                <span className="font-medium text-sm">
                                                                    {jadwal.tanggal ? new Date(jadwal.tanggal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ditentukan'}
                                                                </span>
                                                            </div>

                                                            {/* Actions / Avatars Area */}
                                                            <div className="flex items-center gap-1.5">
                                                                <a
                                                                    href={jadwal.google_calendar_url || '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2.5 rounded-xl transition-all hover:text-[#1b5e20]/50 text-[#1b5e20]"
                                                                    title="Tambahkan ke Calendar"
                                                                >
                                                                    {/* Plus icon inside calendar manually drawn to avoid import issues, or just use Calendar icon */}
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                        <line x1="12" y1="14" x2="12" y2="18"></line>
                                                                        <line x1="10" y1="16" x2="14" y2="16"></line>
                                                                    </svg>
                                                                </a>
                                                                <button
                                                                    onClick={() => toggleAlarm(jadwal.id_jadwal)}
                                                                    className={`p-2.5 rounded-xl transition-all ${alarms[jadwal.id_jadwal] ? 'text-[#1b5e20]' : 'text-[#1b5e20]'} hover:text-[#1b5e20]/50`}
                                                                    title={alarms[jadwal.id_jadwal] ? "Alarm Aktif" : "Set Alarm"}
                                                                >
                                                                    <Bell size={18} className={alarms[jadwal.id_jadwal] ? 'fill-current text-[#1b5e20]' : ''} />
                                                                </button>
                                                            </div>
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
                <div className="xl:col-span-8 flex flex-col">
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="show"
                        className="h-full flex-1"
                    >
                        <ContainerWhite className="!rounded-[2.5rem] !p-6 md:!p-10 h-full flex flex-col items-center justify-center">
                            {/* Calendar Controls */}
                            <div className="flex justify-between items-center w-full mb-10 px-4">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="text-slate-400 hover:text-slate-800 p-2 transition-colors"
                                    aria-label="Bulan sebelumnya"
                                >
                                    &lt;
                                </button>

                                <h3 className="text-2xl font-bold text-slate-800 capitalize">
                                    {monthNames[month]} {year}
                                </h3>

                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="text-slate-400 hover:text-slate-800 p-2 transition-colors"
                                    aria-label="Bulan selanjutnya"
                                >
                                    &gt;
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="w-full">
                                <div className="grid grid-cols-7 mb-6">
                                    {/* Weekday headers */}
                                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((dayName, idx) => (
                                        <div
                                            key={idx}
                                            className="text-center text-slate-400 font-medium text-base py-2"
                                        >
                                            {dayName}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-y-6 gap-x-2">
                                    {/* Grid days */}
                                    {daysArray.map((cell, idx) => {
                                        const isToday = new Date().toDateString() === cell.dateObj.toDateString();
                                        const dateEvents = getEventsForDate(cell.dateObj);
                                        const hasEvents = dateEvents.length > 0;

                                        // Cek apakah semua jadwal di hari itu sudah lewat
                                        const isAllPast = hasEvents && dateEvents.every(evt => isPastEvent(evt.tanggal));

                                        return (
                                            <div
                                                key={idx}
                                                className="flex justify-center items-center"
                                            >
                                                <div className="relative flex justify-center hover:z-50">
                                                    {/* The circle marker */}
                                                    <div
                                                        onClick={() => {
                                                            if (hasEvents) {
                                                                const el = document.getElementById(`jadwal-card-${dateEvents[0].id_jadwal}`);
                                                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            }
                                                        }}
                                                        className={`peer w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-base sm:text-lg font-bold transition-all duration-200 cursor-pointer
                                                            ${hasEvents
                                                                ? isAllPast
                                                                    ? 'bg-slate-200 text-slate-500' // Abu mati, hover warna tetap
                                                                    : 'bg-[#fcc526] text-slate-900 hover:bg-[#fef8e7] hover:text-yellow-800' // Active events
                                                                : cell.isCurrentMonth
                                                                    ? isToday
                                                                        ? 'text-slate-800 border-2 border-yellow-400 hover:bg-[#fef8e7]'
                                                                        : 'text-slate-700 hover:bg-[#1b5e20]/10 hover:text-[#1b5e20]' // Hijau pudar on hover
                                                                    : 'text-slate-300'
                                                            }
                                                        `}
                                                    >
                                                        {cell.day}
                                                    </div>

                                                    {/* Tooltip popup */}
                                                    {hasEvents && (
                                                        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 border rounded-2xl p-4 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-300 z-50 ${isAllPast ? 'bg-slate-100 border-slate-200' : 'bg-[#fef8e7] border-yellow-100'}`}>
                                                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-t border-l rotate-45 ${isAllPast ? 'bg-slate-100 border-slate-200' : 'bg-[#fef8e7] border-yellow-100'}`}></div>
                                                            <div className="relative z-10 flex flex-col gap-3">
                                                                {dateEvents.map(evt => (
                                                                    <div key={evt.id_jadwal} className="flex flex-col gap-0.5">
                                                                        <p className={`font-bold text-sm leading-tight ${isAllPast ? 'text-slate-600' : 'text-slate-800'}`}>{evt.nama_jadwal}</p>
                                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                                            <Clock size={12} className={isAllPast ? 'text-slate-400' : 'text-yellow-600'} />
                                                                            <span>{formatTime(evt.waktu_mulai)} - {formatTime(evt.waktu_selesai)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </ContainerWhite>
                    </motion.div>
                </div>

            </div>
        </SiswaLayout>
    );
}
