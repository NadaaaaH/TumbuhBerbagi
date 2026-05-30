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
    Bell
} from 'lucide-react';

export default function SiswaLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { url } = usePage();

    const notificationRef = useRef(null);
    const mobileNotificationRef = useRef(null);

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
        { name: 'Kegiatan & Info', href: route('siswa.kegiatan.index'), icon: Newspaper, active: url.startsWith('/kegiatan') },
        { name: 'Jadwal Mentoring', href: route('siswa.jadwal'), icon: Calendar, active: url.startsWith('/jadwal') },
        { name: 'Latihan Soal', href: route('siswa.latihan.index'), icon: BookOpen, active: url.startsWith('/latihan') },
        { name: 'Profil Saya', href: route('profile.edit'), icon: User, active: url.startsWith('/profile') },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['Inter',sans-serif] flex">
            {/* Sidebar for Desktop (Left) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10 shrink-0">
                <div className="flex items-center justify-center h-20 border-b border-slate-100">
                    <Link href="/">
                        <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-10 w-auto" />
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                                    item.active
                                        ? 'bg-green-50 text-[#1b5e20]'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-[#1b5e20]' : 'text-slate-400'} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Mobile Navigation */}
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
                                                        <div className={`p-1.5 rounded-lg h-8 w-8 shrink-0 flex items-center justify-center ${
                                                            n.tipe === 'jadwal' 
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
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                                    item.active
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
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
                {/* Topbar for Desktop */}
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-20 shrink-0">
                    <div className="font-['Poppins'] font-semibold text-xl text-slate-800">
                        {header}
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Desktop Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors relative focus:outline-none"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 text-left overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
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
                                    
                                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => {
                                                const Icon = n.tipe === 'jadwal' ? Calendar : BookOpen;
                                                return (
                                                    <div 
                                                        key={n.id_notifikasi}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.is_dibaca ? 'bg-green-50/20' : ''}`}
                                                    >
                                                        <div className={`p-2 rounded-xl h-10 w-10 shrink-0 flex items-center justify-center ${
                                                            n.tipe === 'jadwal' 
                                                                ? 'bg-blue-50 text-blue-600' 
                                                                : 'bg-green-50 text-[#1b5e20]'
                                                        }`}>
                                                            <Icon size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-1">
                                                                <p className={`text-xs sm:text-sm font-medium text-slate-800 truncate ${!n.is_dibaca ? 'font-semibold' : ''}`}>
                                                                    {n.judul}
                                                                </p>
                                                                {!n.is_dibaca && (
                                                                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5 animate-pulse"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                                {n.pesan}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                                {timeAgo(n.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                                                <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-2">
                                                    <Bell size={24} />
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium">Tidak ada notifikasi</p>
                                                <p className="text-[10px] text-slate-400">Semua info terbaru akan muncul di sini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-semibold text-slate-700">{user?.nama || 'Siswa'}</p>
                                <p className="text-xs text-[#1b5e20] font-medium">Siswa Beasiswa</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1b5e20] to-[#508953] flex items-center justify-center text-white font-bold shadow-md">
                                {user?.nama?.charAt(0) || 'S'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Header Title */}
                <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4">
                    <h1 className="font-['Poppins'] font-semibold text-xl text-slate-800">{header}</h1>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 relative">
                    {/* Subtle Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#508953]/5 rounded-full blur-3xl -translate-y-1/2 -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1b5e20]/5 rounded-full blur-3xl translate-y-1/2 -z-10"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        {children}
                    </div>
                </main>

                {/* Footer Section */}
                <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8 relative z-10 mt-auto">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                            <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-6 w-auto opacity-80" />
                            <span className="text-slate-300 hidden sm:inline">|</span>
                            <p className="text-xs text-slate-400 font-medium font-['Poppins']">Menumbuhkan Kepedulian, Berbagi Kebaikan</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-semibold font-['Poppins']">
                            <Link href={route('dashboard')} className="hover:text-[#1b5e20] transition-colors">Beranda</Link>
                            <Link href={route('siswa.kegiatan.index')} className="hover:text-[#1b5e20] transition-colors">Kegiatan</Link>
                            <Link href={route('siswa.jadwal')} className="hover:text-[#1b5e20] transition-colors">Jadwal</Link>
                            <Link href={route('siswa.latihan.index')} className="hover:text-[#1b5e20] transition-colors">Latihan Soal</Link>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto border-t border-slate-100 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                        <p className="text-[10px] text-slate-400">
                            &copy; {new Date().getFullYear()} Tumbuh Berbagi. Hak Cipta Dilindungi.
                        </p>
                        <p className="text-[10px] text-slate-450 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 font-medium">
                            Versi 1.1.0
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
