import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    X,
    Calendar,
    BookOpen,
    Newspaper,
    FileQuestion,
    Award,
    Trophy,
    Bell,
    LogIn,
    PlayCircle,
    CheckCircle2,
    Clock,
    ShieldCheck,
} from 'lucide-react';
import CustomScrollbar from '@/Components/CustomScrollbar';
import PopupModal from '@/Components/PopupModal';

export default function AdminLayout({ user, header, children, recentActivities: propActivities }) {
    const { url, props } = usePage();
    const recentActivities = (propActivities && propActivities.length > 0)
        ? propActivities
        : (props.recentActivities || props.auth?.recentActivities || []);

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    // Hitung unread count berdasarkan activity ID terakhir yang tersimpan di localStorage
    useEffect(() => {
        if (!recentActivities || recentActivities.length === 0) {
            setUnreadCount(0);
            return;
        }

        try {
            const lastSeenId = localStorage.getItem('admin_last_seen_activity_id');
            if (!lastSeenId) {
                setUnreadCount(recentActivities.length);
            } else {
                const count = recentActivities.filter((a) => Number(a.id) > Number(lastSeenId)).length;
                setUnreadCount(count);
            }
        } catch {
            setUnreadCount(recentActivities.length);
        }
    }, [recentActivities]);

    // Buka/tutup notifikasi & tandai dibaca
    const handleToggleNotif = () => {
        const nextState = !showNotif;
        setShowNotif(nextState);

        if (nextState && recentActivities.length > 0) {
            try {
                const latestId = recentActivities[0].id;
                localStorage.setItem('admin_last_seen_activity_id', String(latestId));
            } catch {
                // Ignore storage errors
            }
            setUnreadCount(0);
        }
    };

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper icon & warna aktivitas — style mirip notif siswa (icon berwarna di dalam bg rounded-xl)
    const getActivityMeta = (tipe) => {
        switch (tipe) {
            case 'login':
                return { icon: LogIn, iconClass: 'text-[#1b5e20]', bg: 'bg-green-50' };
            case 'mulai_latihan':
            case 'mulai_tryout':
                return { icon: PlayCircle, iconClass: 'text-blue-600', bg: 'bg-blue-50' };
            case 'selesai_latihan':
            case 'selesai_tryout':
                return { icon: CheckCircle2, iconClass: 'text-[#d99b00]', bg: 'bg-amber-50' };
            default:
                return { icon: Bell, iconClass: 'text-slate-500', bg: 'bg-slate-100' };
        }
    };

    const isTryoutActive = url.startsWith('/admin/paket-tryout') ||
        (url.startsWith('/admin/paket-latihan') && (props.paket?.tipe === 'tryout' || props.fixedTipe === 'tryout' || props.defaultTipe === 'tryout'));

    const isLatihanActive = (url.startsWith('/admin/paket-latihan') && !isTryoutActive);

    const navigation = [
        { name: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard, active: url.startsWith('/admin/dashboard') },
        { name: 'Manajemen Siswa', href: route('siswa.index'), icon: Users, active: url.startsWith('/admin/siswa') },
        { name: 'Kegiatan & Info', href: route('kegiatan.index'), icon: Newspaper, active: url.startsWith('/admin/kegiatan') },
        { name: 'Jadwal', href: route('jadwal.index'), icon: Calendar, active: url.startsWith('/admin/jadwal') },
        { name: 'Paket Try Out', href: route('paket-tryout.index'), icon: Trophy, active: isTryoutActive },
        { name: 'Paket Latihan', href: route('paket-latihan.index'), icon: BookOpen, active: isLatihanActive },
        { name: 'Bank Soal', href: route('soal.index'), icon: FileQuestion, active: url.startsWith('/admin/soal') },
        { name: 'Hasil Latihan', href: route('sesi-latihan.index'), icon: Award, active: url.startsWith('/admin/sesi-latihan') },
        { name: 'Kelola Admin', href: route('admin.manage-admin.index'), icon: ShieldCheck, active: url.startsWith('/admin/kelola-admin') },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter',sans-serif] flex">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#1b5e20] to-[#124216] text-white border-r border-emerald-800/50 fixed h-full z-10 shadow-lg">
                <div className="flex items-center justify-center h-24 border-b border-emerald-800/50 px-6 py-3">
                    <Link href="/" className="flex items-center justify-center">
                        <img src="/images/logo2.png" alt="Tumbuh Berbagi" className="h-[72px] w-auto drop-shadow object-contain hover:scale-105 transition-transform duration-200" />
                    </Link>
                </div>

                <CustomScrollbar theme="dark" className="flex-1 py-6 px-4">
                    <div className="space-y-1.5">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${item.active
                                    ? 'bg-[#fcc526] text-slate-950 font-bold shadow-[0_4px_20px_rgba(252,197,38,0.35)]'
                                    : 'text-white hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-slate-950' : 'text-white'} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </CustomScrollbar>

                <div className="p-4 border-t border-emerald-800/50">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-300 rounded-2xl hover:bg-red-500/20 hover:text-red-200 transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed top-0 w-full bg-[#1b5e20] border-b border-emerald-800/50 z-20">
                <div className="flex items-center justify-between h-16 px-4">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo2.png" alt="Tumbuh Berbagi" className="h-10 w-auto drop-shadow" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleNotif}
                            className="p-2 rounded-xl text-white hover:bg-white/10 relative focus:outline-none cursor-pointer"
                            aria-label="Notifikasi"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#fcc526] text-[9px] font-extrabold text-slate-950 ring-2 ring-[#1b5e20] animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition duration-150 ease-in-out cursor-pointer"
                        >
                            {showingNavigationDropdown ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div className="px-3 pt-2 pb-4 space-y-1.5 bg-[#124216] border-b border-emerald-800/50 shadow-lg">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium transition-all ${item.active
                                    ? 'bg-[#fcc526] text-slate-950 font-bold'
                                    : 'text-white hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-slate-950' : 'text-white'} />
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-base font-medium text-red-300 hover:bg-red-500/20 cursor-pointer"
                        >
                            <LogOut size={20} />
                            Keluar
                        </Link>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
                {/* Topbar for Desktop */}
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-20 shrink-0">
                    <div className="font-['Poppins'] font-semibold text-xl text-slate-800">
                        {header}
                    </div>
                    <div className="flex items-center gap-4">

                        {/* ── Notification Bell ──────────────────────────── */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={handleToggleNotif}
                                className="p-2.5 rounded-2xl text-slate-600 hover:text-[#fcc526] hover:bg-[#1b5e20] transition-all duration-200 relative focus:outline-none cursor-pointer"
                                aria-label="Notifikasi"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#fcc526] text-[10px] font-extrabold text-slate-950 ring-2 ring-white animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Notifikasi */}
                            {showNotif && (
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-3xl border border-slate-100 shadow-2xl z-40 overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
                                        <h4 className="font-semibold text-slate-800 text-sm font-['Poppins']">
                                            Aktivitas Terbaru
                                        </h4>
                                        {recentActivities.length > 0 && (
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {recentActivities.length} aktivitas
                                            </span>
                                        )}
                                    </div>

                                    {/* List */}
                                    <CustomScrollbar theme="light" className="divide-y divide-slate-50" maxHeight="320px">
                                        {recentActivities.length > 0 ? (
                                            recentActivities.map((act, i) => {
                                                const meta = getActivityMeta(act.tipe);
                                                const Icon = meta.icon;
                                                return (
                                                    <div key={act.id || i} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                                                        <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${meta.bg}`}>
                                                            <Icon size={16} className={meta.iconClass} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-slate-800 truncate">{act.nama_siswa}</p>
                                                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{act.deskripsi}</p>
                                                            <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                                                                <Clock size={9} />
                                                                {act.waktu}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-8 text-center text-xs text-slate-400">
                                                Belum ada aktivitas terbaru.
                                            </div>
                                        )}
                                    </CustomScrollbar>

                                    {/* Footer */}
                                    <div className="px-5 py-3.5 border-t border-slate-50 bg-slate-50/80">
                                        <button
                                            onClick={() => { setShowNotif(false); setShowAllModal(true); }}
                                            className="text-xs font-bold text-[#1b5e20] hover:underline cursor-pointer"
                                        >
                                            Lihat semua aktivitas →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Admin Info ─────────────────────────────────── */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-semibold text-slate-700">{user?.nama}</p>
                                <p className="text-xs text-slate-500">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#1b5e20] flex items-center justify-center text-white font-bold shadow-sm">
                                {user?.nama?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Header Title */}
                <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4">
                    <h1 className="font-['Poppins'] font-semibold text-xl text-slate-800">{header}</h1>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* ─── Popup Modal: Semua Aktivitas ─────────────────────────────── */}
            <PopupModal
                isOpen={showAllModal}
                onClose={() => setShowAllModal(false)}
                maxWidth="lg"
                padding="p-0"
                className="!overflow-hidden"
            >
                {/* Modal Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                        <Bell size={18} className="text-[#1b5e20]" />
                    </div>
                    <div>
                        <h3 className="font-['Poppins'] text-base font-bold text-slate-900">Semua Aktivitas Siswa</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {recentActivities.length > 0
                                ? `${recentActivities.length} aktivitas tercatat`
                                : 'Belum ada aktivitas'}
                        </p>
                    </div>
                </div>

                {/* Modal Body */}
                <CustomScrollbar theme="light" maxHeight="480px" className="divide-y divide-slate-50">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((act, i) => {
                            const meta = getActivityMeta(act.tipe);
                            const Icon = meta.icon;
                            return (
                                <div key={act.id || i} className="flex items-start gap-3.5 px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${meta.bg}`}>
                                        <Icon size={16} className={meta.iconClass} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{act.nama_siswa}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.deskripsi}</p>
                                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                            <Clock size={10} />
                                            {act.waktu}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center text-sm text-slate-400">
                            Belum ada aktivitas siswa yang tercatat.
                        </div>
                    )}
                </CustomScrollbar>
            </PopupModal>
        </div>
    );
}
