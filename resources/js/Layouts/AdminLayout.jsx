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
    Award
} from 'lucide-react';

export default function AdminLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url } = usePage();

        const navigation = [
        { name: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard, active: url.startsWith('/admin/dashboard') },
        { name: 'Manajemen Siswa', href: route('siswa.index'), icon: Users, active: url.startsWith('/admin/siswa') },
        { name: 'Kegiatan & Info', href: route('kegiatan.index'), icon: Newspaper, active: url.startsWith('/admin/kegiatan') },
        { name: 'Jadwal', href: route('jadwal.index'), icon: Calendar, active: url.startsWith('/admin/jadwal') },
        { name: 'Paket Latihan', href: route('paket-latihan.index'), icon: BookOpen, active: url.startsWith('/admin/paket-latihan') },
        { name: 'Bank Soal', href: route('soal.index'), icon: FileQuestion, active: url.startsWith('/admin/soal') },
        { name: 'Hasil Latihan', href: route('sesi-latihan.index'), icon: Award, active: url.startsWith('/admin/sesi-latihan') },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter',sans-serif] flex">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
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
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${item.active
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
                    <button
                        onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                        className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:bg-slate-100 focus:text-slate-500 transition duration-150 ease-in-out"
                    >
                        {showingNavigationDropdown ? <X size={24} /> : <Menu size={24} />}
                    </button>
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
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
                {/* Topbar for Desktop */}
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-10">
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
