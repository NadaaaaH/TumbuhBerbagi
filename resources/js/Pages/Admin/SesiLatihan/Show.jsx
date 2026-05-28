import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Download, FileSpreadsheet, CheckCircle2, XCircle, Clock, Award, Users } from 'lucide-react';

export default function Show({ auth, paket, pesertaSudah, pesertaBelum, questionStats }) {
    return (
        <AdminLayout user={auth.user} header={`Detail Sesi Latihan: ${paket.nama_paket}`}>
            <Head title={`Sesi ${paket.nama_paket}`} />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Link
                    href={route('sesi-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Sesi Latihan
                </Link>

                {pesertaSudah.length > 0 && (
                    <a
                        href={route('sesi-latihan.export-all', paket.id_paket)}
                        className="inline-flex items-center justify-center gap-2 bg-[#1b5e20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#144718] transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        Ekspor Hasil Semua Peserta
                    </a>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Left Column: Participants */}
                <div className="space-y-6">
                    {/* Already Attempted List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Award className="text-green-600" size={20} />
                                Sudah Mengerjakan ({pesertaSudah.length})
                            </h2>
                        </div>

                        {pesertaSudah.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="pb-3 pr-4">Nama Siswa</th>
                                            <th className="pb-3 px-4">Nilai</th>
                                            <th className="pb-3 px-4">Benar/Salah</th>
                                            <th className="pb-3 px-4">Durasi</th>
                                            <th className="pb-3 pl-4 text-right">Laporan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pesertaSudah.map((sesi) => {
                                            const duration = sesi.waktu_selesai && sesi.waktu_mulai
                                                ? Math.round((new Date(sesi.waktu_selesai) - new Date(sesi.waktu_mulai)) / 1000 / 60)
                                                : null;

                                            return (
                                                <tr key={sesi.id_sesi} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div className="font-semibold text-slate-900">{sesi.siswa?.nama}</div>
                                                        <div className="text-xs text-slate-500">{sesi.siswa?.email}</div>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-[#1b5e20]">
                                                            {sesi.hasil_latihan?.nilai_akhir ?? 0}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                {sesi.hasil_latihan?.jumlah_benar ?? 0} B
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                                                {sesi.hasil_latihan?.jumlah_salah ?? 0} S
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {duration !== null ? `${duration} Menit` : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                                                        <a
                                                            href={route('sesi-latihan.export-siswa', sesi.id_sesi)}
                                                            className="inline-flex items-center gap-1.5 text-xs text-[#1b5e20] hover:text-[#144718] font-bold py-1 px-3.5 rounded-lg border border-green-200 bg-green-50/50 hover:bg-green-150 transition-colors"
                                                            title="Ekspor Jawaban Siswa ke CSV"
                                                        >
                                                            <FileSpreadsheet size={14} />
                                                            Ekspor
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-6">Belum ada siswa yang menyelesaikan latihan ini.</p>
                        )}
                    </div>

                    {/* Not Attempted List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Users className="text-slate-500" size={20} />
                            Belum Mengerjakan ({pesertaBelum.length})
                        </h2>
                        {pesertaBelum.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {pesertaBelum.map((siswa) => (
                                    <div key={siswa.id_siswa} className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between bg-slate-50/50">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-800">{siswa.nama}</div>
                                            <div className="text-xs text-slate-500">{siswa.email}</div>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                                            Belum Mulai
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">Semua siswa sudah mengerjakan latihan ini.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Question Statistics */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-semibold text-slate-950">Statistik Tiap Soal</h3>
                        </div>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            {questionStats.map((stat, idx) => {
                                const total = stat.jumlah_benar + stat.jumlah_salah;
                                const rate = total > 0 ? Math.round((stat.jumlah_benar / total) * 100) : 0;

                                return (
                                    <div key={stat.id_soal} className="p-4 border border-slate-250 rounded-2xl bg-slate-50/50 space-y-3">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Soal {idx + 1}</div>
                                        <div className="text-sm font-semibold text-slate-900 line-clamp-3" title={stat.konten_soal}>
                                            {stat.konten_soal}
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 gap-4">
                                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                                <CheckCircle2 size={12} />
                                                Benar: {stat.jumlah_benar}
                                            </span>
                                            <span className="flex items-center gap-1 text-rose-700 font-semibold">
                                                <XCircle size={12} />
                                                Salah: {stat.jumlah_salah}
                                            </span>
                                        </div>
                                        {total > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                                                    <span>Tingkat Akurasi</span>
                                                    <span>{rate}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-[#1b5e20] h-1.5 rounded-full" style={{ width: `${rate}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
