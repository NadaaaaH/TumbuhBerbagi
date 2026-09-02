import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, BookOpen, Calendar, TrendingUp, Bell, CheckCircle2, PlayCircle, LogIn, ChevronRight, Activity, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard({ auth, stats = {}, chartData = [], notifications = [], activePackages = [] }) {
    const dashboardStats = [
        { name: 'Total Siswa', value: stats.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
        { name: 'Jadwal Mentoring', value: stats.totalJadwals || 0, icon: Calendar, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
        { name: 'Latihan Soal', value: stats.totalLatihanSoal || 0, icon: BookOpen, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
        { name: 'Tingkat Aktivitas', value: `${stats.tingkatAktivitas || 0}%`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
    ];

    const getIconForActivity = (type) => {
        switch (type) {
            case 'login': return <LogIn size={16} className="text-emerald-500" />;
            case 'mulai_latihan': return <PlayCircle size={16} className="text-blue-500" />;
            case 'selesai_latihan': return <CheckCircle2 size={16} className="text-purple-500" />;
            default: return <Bell size={16} className="text-slate-500" />;
        }
    };

    return (
        <AdminLayout user={auth.user} header="Dashboard Admin">
            <Head title="Admin Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardStats.map((stat, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.name} 
                        className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
                    >
                        <div className={`p-4 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Chart and Active Packages */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart Section */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 blur-3xl"></div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                                    <Activity className="text-[#1b5e20]" size={24} />
                                    Statistik Pengunjung
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">Tren kehadiran siswa dan tamu 7 hari terakhir</p>
                            </div>
                        </div>
                        
                        <div className="h-80 w-full relative z-10">
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                        <Line type="monotone" name="Siswa Aktif" dataKey="jumlah_siswa" stroke="#1b5e20" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} animationDuration={1500} />
                                        <Line type="monotone" name="Tamu / Asing" dataKey="jumlah_tamu" stroke="#94a3b8" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} animationDuration={1500} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">Belum ada data pengunjung</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Active Packages */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <BookOpen className="text-orange-500" size={20} />
                                Latihan Soal Aktif
                            </h3>
                            <Link href={route('paket-latihan.index')} className="text-sm font-medium text-[#1b5e20] hover:underline flex items-center">
                                Lihat Semua <ChevronRight size={16} />
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {activePackages && activePackages.length > 0 ? (
                                activePackages.map((paket) => (
                                    <div key={paket.id_paket} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{paket.nama_paket}</h4>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> {paket.soal_count} Soal</span>
                                                    {paket.waktu_ujian > 0 && (
                                                        <span className="flex items-center gap-1"><Clock size={14}/> {paket.waktu_ujian} Menit</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={route('paket-latihan.show', paket.id_paket)} className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:border-orange-300 transition-colors">
                                            <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    Tidak ada paket latihan yang aktif.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Notifications */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[800px]"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Bell className="text-purple-500" size={20} />
                            Log Aktivitas Siswa
                        </h3>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-lg">Live</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                        {notifications && notifications.length > 0 ? (
                            <div className="space-y-1 p-2">
                                {notifications.map((notif, i) => (
                                    <div key={notif.id} className="p-4 rounded-2xl hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            {getIconForActivity(notif.tipe)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{notif.siswa}</p>
                                            <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{notif.deskripsi}</p>
                                            <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                                                <Clock size={12} /> {notif.waktu}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                <Bell size={32} className="opacity-20" />
                                <p>Belum ada aktivitas siswa.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
