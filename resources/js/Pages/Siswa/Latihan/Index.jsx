import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { BookOpen, CheckCircle2, Clock, PlayCircle, Eye } from 'lucide-react';

export default function Index({ auth, pakets, ongoingPackages = [], completedPackages = [] }) {
    return (
        <SiswaLayout user={auth.user} header="Latihan Soal UTBK">
            <Head title="Latihan Soal" />

            <div className="grid gap-6 md:grid-cols-2">
                {pakets.length > 0 ? (
                    pakets.map((paket) => {
                        const isCompleted = completedPackages.includes(paket.id_paket);
                        const isOngoing = ongoingPackages.includes(paket.id_paket);

                        return (
                            <div key={paket.id_paket} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">{paket.nama_paket}</h2>
                                            <p className="text-sm text-slate-500 mt-1">{paket.deskripsi || 'Tidak ada deskripsi tersedia.'}</p>
                                        </div>
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 text-green-600 shrink-0">
                                            <BookOpen size={24} />
                                        </div>
                                    </div>

                                    <div className="grid gap-3 mb-6 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Soal aktif:</span>
                                            <span className="font-semibold text-slate-900">{paket.soal_count}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Status Pengerjaan:</span>
                                            {isCompleted ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    Selesai
                                                </span>
                                            ) : isOngoing ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                    Sedang Dikerjakan
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                                    Belum Mulai
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                    {isCompleted ? (
                                        <Link
                                            href={route('siswa.latihan.hasil', paket.id_paket)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-900 transition-colors"
                                        >
                                            <Eye size={16} />
                                            Lihat Hasil & Pembahasan
                                        </Link>
                                    ) : isOngoing ? (
                                        <Link
                                            href={route('siswa.latihan.show', paket.id_paket)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 text-white px-5 py-3 text-sm font-semibold hover:bg-amber-700 transition-colors"
                                        >
                                            <PlayCircle size={16} />
                                            Lanjutkan Latihan
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('siswa.latihan.show', paket.id_paket)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1b5e20] text-white px-5 py-3 text-sm font-semibold hover:bg-[#144718] transition-colors"
                                        >
                                            <PlayCircle size={16} />
                                            Mulai Latihan
                                        </Link>
                                    )}
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                                <span>Sudah pernah dikerjakan. Klik di atas untuk meninjau pembahasan & statistik.</span>
                                            </>
                                        ) : isOngoing ? (
                                            <>
                                                <Clock size={16} className="text-amber-600 shrink-0" />
                                                <span>Pengerjaan tertunda. Lanjutkan untuk mengirimkan jawaban Anda.</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle size={16} className="text-slate-400 shrink-0" />
                                                <span>Belum dikerjakan. Klik tombol di atas untuk memulai latihan ini.</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-600">
                        <Clock size={32} className="mx-auto mb-4 text-slate-400" />
                        <p className="text-sm font-medium">Tidak ada sesi latihan aktif saat ini.</p>
                    </div>
                )}
            </div>
        </SiswaLayout>
    );
}
