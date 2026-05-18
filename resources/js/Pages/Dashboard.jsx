import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Calendar, Newspaper, ArrowRight, Bell } from 'lucide-react';

export default function Dashboard({ auth }) {
    return (
        <SiswaLayout
            user={auth.user}
            header="Beranda Siswa"
        >
            <Head title="Dashboard Siswa" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 font-['Poppins']">
                    Selamat datang, {auth.user?.nama}! 👋
                </h2>
                <p className="text-slate-500 mt-2">Ini adalah halaman utama panel beasiswa Anda. Tetap semangat belajar!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Jadwal Terdekat Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-6 -top-6 bg-green-50 p-8 rounded-full group-hover:scale-110 transition-transform">
                        <Calendar size={48} className="text-[#1b5e20] opacity-20" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                            <Calendar size={24} />
                        </div>
                        <h3 className="font-semibold text-lg text-slate-800">Jadwal Mentoring Terdekat</h3>
                    </div>
                    
                    <div className="space-y-1 mb-6 relative z-10">
                        <p className="text-2xl font-bold text-slate-900">Belum ada jadwal</p>
                        <p className="text-sm text-slate-500">Admin belum menambahkan jadwal untuk Anda.</p>
                    </div>

                    <Link href={route('siswa.jadwal')} className="inline-flex items-center gap-2 text-sm font-medium text-[#1b5e20] hover:text-[#508953] transition-colors relative z-10">
                        Lihat Semua Jadwal <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Kegiatan Terbaru Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-6 -top-6 bg-orange-50 p-8 rounded-full group-hover:scale-110 transition-transform">
                        <Newspaper size={48} className="text-orange-600 opacity-20" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                            <Newspaper size={24} />
                        </div>
                        <h3 className="font-semibold text-lg text-slate-800">Informasi & Kegiatan</h3>
                    </div>
                    
                    <div className="space-y-1 mb-6 relative z-10">
                        <p className="text-2xl font-bold text-slate-900">Cek Info Terbaru</p>
                        <p className="text-sm text-slate-500">Ada informasi dan kegiatan penting yang menunggu.</p>
                    </div>

                    <Link href={route('siswa.kegiatan.index')} className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors relative z-10">
                        Lihat Papan Informasi <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Quick Actions / Info */}
            <div className="bg-gradient-to-r from-[#1b5e20] to-[#508953] rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold font-['Poppins'] mb-2 flex items-center gap-2">
                        <Bell size={20} /> Jangan Lewatkan Info Penting!
                    </h3>
                    <p className="text-green-50 max-w-2xl text-sm md:text-base">
                        Pastikan Anda selalu memeriksa halaman Jadwal dan Kegiatan secara rutin. 
                        Anda juga bisa mengatur pengingat otomatis ke email Anda melalui halaman Jadwal Mentoring.
                    </p>
                </div>
                <Link href={route('siswa.jadwal')} className="shrink-0 bg-white text-[#1b5e20] px-6 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors shadow-sm">
                    Atur Pengingat Sekarang
                </Link>
            </div>
        </SiswaLayout>
    );
}
