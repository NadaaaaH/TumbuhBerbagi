import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

export default function Index({ auth, kegiatans }) {
    return (
        <SiswaLayout user={auth.user} header="Kegiatan & Informasi">
            <Head title="Kegiatan Siswa" />

            <div className="mb-6">
                <p className="text-slate-500">
                    Kumpulan informasi, pengumuman, dan dokumentasi kegiatan beasiswa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kegiatans && kegiatans.length > 0 ? (
                    kegiatans.map((kegiatan) => (
                        <div key={kegiatan.id_kegiatan} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                            {/* Image Placeholder */}
                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                {kegiatan.gambar_url || kegiatan.gambar ? (
                                    <img 
                                        src={kegiatan.gambar_url || `/storage/${kegiatan.gambar}`} 
                                        alt={kegiatan.nama_kegiatan} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                        <Newspaper size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#1b5e20] shadow-sm flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2 leading-tight">
                                    {kegiatan.nama_kegiatan}
                                </h3>
                                
                                <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                                    {kegiatan.deskripsi}
                                </p>

                                <div className="mt-auto">
                                    <Link 
                                        href={route('siswa.kegiatan.show', kegiatan.id_kegiatan)}
                                        className="inline-flex items-center gap-2 text-[#1b5e20] font-medium text-sm hover:text-[#508953] transition-colors group/link"
                                    >
                                        Baca Selengkapnya
                                        <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                            <Newspaper size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Informasi</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Saat ini belum ada informasi atau kegiatan terbaru yang dipublikasikan oleh admin.
                        </p>
                    </div>
                )}
            </div>
        </SiswaLayout>
    );
}
