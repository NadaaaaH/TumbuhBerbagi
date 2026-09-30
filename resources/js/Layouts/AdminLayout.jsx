import React, { useState } from 'react';
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
    Trophy
} from 'lucide-react';
import CustomScrollbar from '@/Components/CustomScrollbar';

export default function AdminLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url, props } = usePage();

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
                    <button
                        onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                        className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition duration-150 ease-in-out cursor-pointer"
                    >
                        {showingNavigationDropdown ? <X size={24} /> : <Menu size={24} />}
                    </button>
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
        </div>
    );
}
