import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Calendar, Clock, MapPin, Bell, CheckCircle2 } from 'lucide-react';

export default function Index({ auth, jadwals }) {
    const [alarms, setAlarms] = useState({});

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
        return String(time).slice(0,5);
    };

    const toggleAlarm = (id) => {
        setAlarms(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        // Di sini nantinya bisa disambungkan ke backend API untuk mengirim email
        // axios.post(route('siswa.jadwal.alarm', id))
    };

    return (
        <SiswaLayout user={auth.user} header="Jadwal Mentoring">
            <Head title="Jadwal Mentoring" />

            <div className="mb-6">
                <p className="text-slate-500">
                    Berikut adalah jadwal mentoring dan pertemuan Anda. Aktifkan pengingat agar tidak terlewat.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jadwals && jadwals.length > 0 ? (
                    jadwals.map((jadwal) => (
                        <div key={jadwal.id_jadwal} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                            <div className="bg-gradient-to-r from-[#1b5e20] to-[#508953] px-5 py-3 text-white flex items-center justify-between">
                                <h3 className="font-semibold font-['Poppins'] text-base truncate">{jadwal.nama_kegiatan || 'Jadwal Mentoring'}</h3>
                                <Calendar size={20} className="opacity-90 shrink-0" />
                            </div>

                            <div className="p-5 flex-1 flex flex-col space-y-3">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <Calendar size={18} className="text-white bg-[#1b5e20] rounded-full p-0.5" />
                                    <span className="text-sm">{formatDate(jadwal.tanggal)}</span>
                                </div>

                                <div className="flex items-center gap-3 text-slate-700">
                                    <Clock size={18} className="text-orange-500" />
                                    <span className="text-sm">{formatTime(jadwal.waktu_mulai)} - {formatTime(jadwal.waktu_selesai)} WIB</span>
                                </div>

                                <div className="flex items-start gap-3 text-slate-700">
                                    <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-sm line-clamp-2">{jadwal.lokasi || 'Online / Zoom'}</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => toggleAlarm(jadwal.id_jadwal)}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${
                                            alarms[jadwal.id_jadwal] 
                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                    >
                                        {alarms[jadwal.id_jadwal] ? (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Pengingat Email Aktif
                                            </>
                                        ) : (
                                            <>
                                                <Bell size={18} />
                                                Set Alarm ke Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                            <Calendar size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Jadwal</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Saat ini belum ada jadwal mentoring yang ditambahkan oleh admin untuk Anda.
                        </p>
                    </div>
                )}
            </div>
        </SiswaLayout>
    );
}
