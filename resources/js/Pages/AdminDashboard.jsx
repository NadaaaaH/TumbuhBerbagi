import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

export default function AdminDashboard({ auth }) {
    const stats = [
        { name: 'Total Siswa', value: '0', icon: Users, color: 'bg-blue-50 text-blue-600' },
        { name: 'Jadwal Mentoring', value: '0', icon: Calendar, color: 'bg-green-50 text-green-600' },
        { name: 'Latihan Soal', value: '0', icon: BookOpen, color: 'bg-orange-50 text-orange-600' },
        { name: 'Tingkat Aktivitas', value: '0%', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    ];

    return (
        <AdminLayout
            user={auth.user}
            header="Dashboard Admin"
        >
            <Head title="Admin Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Aktivitas Terbaru</h3>
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <TrendingUp size={48} className="mb-4 opacity-20" />
                        <p>Belum ada aktivitas terbaru.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Pintasan</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors border border-slate-100 flex items-center justify-between group">
                            Tambah Siswa Baru
                            <Users size={18} className="text-slate-400 group-hover:text-[#1b5e20]" />
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors border border-slate-100 flex items-center justify-between group">
                            Buat Jadwal Baru
                            <Calendar size={18} className="text-slate-400 group-hover:text-[#1b5e20]" />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
