import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    X,
    Calendar,
    Newspaper,
    BookOpen,
    ClipboardList,
    Bell
} from 'lucide-react';
import Footer from '../Pages/Welcome/Partials/Footer';
import CustomScrollbar from '@/Components/CustomScrollbar';

export default function SiswaLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarBottom, setSidebarBottom] = useState(16);
    const { url } = usePage();

    const notificationRef = useRef(null);
    const mobileNotificationRef = useRef(null);
    const footerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                (notificationRef.current && !notificationRef.current.contains(event.target)) &&
                (mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target))
            ) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!footerRef.current) return;
            const footerRect = footerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const calculatedBottom = windowHeight - footerRect.top + 20;
            setSidebarBottom(Math.max(16, calculatedBottom));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { auth } = usePage().props;
    const notifications = auth.notifications || [];
    const unreadCount = notifications.filter(n => !n.is_dibaca).length;

    const timeAgo = (dateString) => {
        try {
            const now = new Date();
            const date = new Date(dateString);
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} menit lalu`;
            if (diffHours < 24) return `${diffHours} jam lalu`;
            if (diffDays === 1) return 'Kemarin';
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return '';
        }
    };

    const handleMarkAllRead = (e) => {
        e.stopPropagation();
        router.post(route('siswa.notifications.read-all'), {}, {
            preserveScroll: true,
            onSuccess: () => setShowNotifications(false)
        });
    };

    const handleNotificationClick = (n) => {
        setShowNotifications(false);
        if (!n.is_dibaca) {
            router.post(route('siswa.notifications.read', n.id_notifikasi), {}, {
                preserveScroll: true
            });
        }
        if (n.tipe === 'jadwal') {
            router.visit(route('siswa.jadwal'));
        } else if (n.tipe === 'latihan') {
            router.visit(route('siswa.latihan.index'));
        }
    };

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: url === '/dashboard' },
        { name: 'Latihan Soal', href: route('siswa.latihan.index'), icon: BookOpen, active: url.startsWith('/latihan') },
        { name: 'Try Out', href: route('siswa.tryout.index'), icon: ClipboardList, active: url.startsWith('/tryout') },
        { name: 'Kegiatan & Info', href: route('siswa.kegiatan.index'), icon: Newspaper, active: url.startsWith('/kegiatan') },
        { name: 'Jadwal Mentoring', href: route('siswa.jadwal'), icon: Calendar, active: url.startsWith('/jadwal') },
        { name: 'Profil Saya', href: route('profile.show'), icon: User, active: url.startsWith('/profil') || url.startsWith('/profile') },
    ];

    return (
        <div className="min-h-screen bg-[#FAFBFC] font-['Inter',sans-serif] flex">

            {/* Sidebar for Desktop (Right Side Floating Layout with Smart Sticky Footer Offset) */}
            <aside
                className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#1b5e20] to-[#124216] text-white border border-emerald-800/50 fixed right-4 top-4 z-30 shrink-0 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-[2.2rem] overflow-hidden"
                style={{ bottom: `${sidebarBottom}px` }}
            >

                {/* Logo & Notification Bell Header */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-emerald-800/50">
                    <Link href="/">
                        <img src="/images/logo2.png" alt="Tumbuh Berbagi" className="h-9 w-auto drop-shadow" />
                    </Link>

                    {/* Desktop Notification Bell */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2.5 rounded-2xl text-emerald-100 hover:text-[#fcc526] hover:bg-white/10 transition-colors relative focus:outline-none"
                            aria-label="Notifikasi"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#fcc526] text-[10px] font-extrabold text-slate-950 ring-2 ring-[#1b5e20] animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-3xl border border-slate-100 shadow-2xl py-2 z-50 text-left overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                                    <h4 className="font-semibold text-slate-800 text-sm font-['Poppins']">Notifikasi</h4>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs font-medium text-[#1b5e20] hover:text-[#508953] hover:underline transition-all"
                                        >
                                            Tandai semua dibaca
                                        </button>
                                    )}
                                </div>

                                <CustomScrollbar theme="light" className="max-h-[360px] divide-y divide-slate-50">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => {
                                            const Icon = n.tipe === 'jadwal' ? Calendar : BookOpen;
                                            return (
                                                <div
                                                    key={n.id_notifikasi}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`p-3.5 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.is_dibaca ? 'bg-green-50/20' : ''}`}
                                                >
                                                    <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${n.tipe === 'jadwal'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-green-50 text-[#1b5e20]'
                                                        }`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-1">
                                                            <p className={`text-xs font-medium text-slate-800 truncate ${!n.is_dibaca ? 'font-semibold' : ''}`}>
                                                                {n.judul}
                                                            </p>
                                                            {!n.is_dibaca && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1 animate-pulse"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                                            {n.pesan}
                                                        </p>
                                                        <span className="text-[9px] text-slate-400 mt-1 block">
                                                            {timeAgo(n.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                                            <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-2">
                                                <Bell size={20} />
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">Tidak ada notifikasi</p>
                                        </div>
                                    )}
                                </CustomScrollbar>
                            </div>
                        )}
                    </div>
                </div>

                {/* Integrated User Profile Card */}
                <div className="p-3.5 mx-4 mt-4 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#fcc526] text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 text-base">
                        {user?.nama?.charAt(0) || 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate leading-snug">{user?.nama || 'Siswa'}</p>
                        <p className="text-[10px] text-[#fcc526] font-semibold">Siswa Beasiswa</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <CustomScrollbar theme="dark" className="flex-1 py-4 px-4">
                    <div className="space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${item.active
                                    ? 'bg-[#fcc526] text-slate-950 font-bold shadow-[0_4px_20px_rgba(252,197,38,0.35)]'
                                    : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-slate-950' : 'text-[#fcc526]'} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </CustomScrollbar>

                {/* Logout Button */}
                <div className="p-4 border-t border-emerald-800/50">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-300 rounded-2xl hover:bg-red-500/20 hover:text-red-200 transition-colors"
                    >
                        <LogOut size={20} />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-20">
                <div className="flex items-center justify-between h-16 px-4">
                    <Link href="/">
                        <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-8 w-auto" />
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Mobile Notification Bell */}
                        <div className="relative" ref={mobileNotificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors relative"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-[280px] sm:w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 text-left overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
                                        <h4 className="font-semibold text-slate-800 text-xs font-['Poppins']">Notifikasi</h4>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-[10px] font-medium text-[#1b5e20] hover:text-[#508953] hover:underline transition-all"
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => {
                                                const Icon = n.tipe === 'jadwal' ? Calendar : BookOpen;
                                                return (
                                                    <div
                                                        key={n.id_notifikasi}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`p-3 flex gap-2 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.is_dibaca ? 'bg-green-50/20' : ''}`}
                                                    >
                                                        <div className={`p-1.5 rounded-lg h-8 w-8 shrink-0 flex items-center justify-center ${n.tipe === 'jadwal'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'bg-green-50 text-[#1b5e20]'
                                                            }`}>
                                                            <Icon size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-1">
                                                                <p className={`text-xs font-medium text-slate-800 truncate ${!n.is_dibaca ? 'font-semibold' : ''}`}>
                                                                    {n.judul}
                                                                </p>
                                                                {!n.is_dibaca && (
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                                                                {n.pesan}
                                                            </p>
                                                            <span className="text-[8px] text-slate-400 mt-1 block">
                                                                {timeAgo(n.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-6 px-4 flex flex-col items-center justify-center text-center">
                                                <div className="p-2 bg-slate-50 rounded-full text-slate-400 mb-1">
                                                    <Bell size={18} />
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium">Tidak ada notifikasi</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:bg-slate-100 focus:text-slate-500 transition duration-150 ease-in-out"
                        >
                            {showingNavigationDropdown ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-slate-200 shadow-lg">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${item.active
                                    ? 'bg-green-50 text-[#1b5e20]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-[#1b5e20]' : 'text-slate-400'} />
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={20} />
                            Keluar
                        </Link>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0 min-w-0 overflow-x-hidden">

                {/* Mobile Header Title */}
                <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4">
                    <h1 className="font-['Poppins'] font-semibold text-xl text-slate-800">{header}</h1>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 md:mr-72 relative">
                    {/* Subtle Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#508953]/5 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1b5e20]/5 rounded-full blur-3xl translate-y-1/2 -z-10"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        {children}
                    </div>
                </main>

                {/* Footer Section (Standard layout matching landing page, with ref for sticky sidebar detection) */}
                <div className="w-full relative z-10" ref={footerRef}>
                    <Footer />
                </div>
            </div>
        </div>
    );
}
