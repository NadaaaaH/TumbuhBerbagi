import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Show({ auth, kegiatan }) {
    const formattedDate = useMemo(() => {
        if (!kegiatan.tanggal) return '-';
        return new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }, [kegiatan.tanggal]);

    const images = useMemo(() => {
        if (!kegiatan.gambar) return [];
        try {
            const trimmed = kegiatan.gambar.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map(img => img.startsWith('http') ? img : `/storage/${img}`);
                }
            }
        } catch (e) {}

        if (kegiatan.gambar.includes(',')) {
            return kegiatan.gambar.split(',').map(img => img.trim().startsWith('http') ? img.trim() : `/storage/${img.trim()}`);
        }

        const fallbackUrl = kegiatan.gambar_url || `/storage/${kegiatan.gambar}`;
        return [fallbackUrl];
    }, [kegiatan]);

    return (
        <SiswaLayout user={auth.user} header="Detail Kegiatan">
            <Head title={kegiatan.nama_kegiatan} />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={route('siswa.kegiatan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-semibold"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Kegiatan & Informasi
                </Link>
            </div>

            {/* Vertical layout: Large image, title, date/time, content, Instagram link */}
            <div className="max-w-4xl mx-auto pt-4 space-y-8">
                
                {/* 1. Large Image Showcase / Swiper */}
                <div className="w-full h-[320px] md:h-[480px] rounded-[2.5rem] overflow-hidden bg-slate-50 relative border border-slate-100/60 shadow-sm">
                    {images.length > 0 ? (
                        images.length > 1 ? (
                            <Swiper
                                modules={[Autoplay, Pagination, Navigation]}
                                spaceBetween={0}
                                slidesPerView={1}
                                loop={true}
                                autoplay={{
                                    delay: 3500,
                                    disableOnInteraction: false,
                                }}
                                pagination={{ clickable: true }}
                                navigation={true}
                                className="w-full h-full"
                            >
                                {images.map((imgUrl, idx) => (
                                    <SwiperSlide key={idx} className="w-full h-full">
                                        <img
                                            src={imgUrl}
                                            alt={`${kegiatan.nama_kegiatan} - gambar ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <img
                                src={images[0]}
                                alt={kegiatan.nama_kegiatan}
                                className="w-full h-full object-cover"
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                            <Calendar size={64} opacity={0.2} />
                        </div>
                    )}
                </div>

                {/* 2. Text Details */}
                <div className="space-y-6">
                    <div>
                        {/* Title */}
                        <h1 className="font-['Poppins'] text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight mb-4">
                            {kegiatan.nama_kegiatan}
                        </h1>

                        {/* Date and Time metadata, styled cleanly */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#1b5e20] font-bold mb-6">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 shadow-sm">
                                <Calendar size={15} />
                                {formattedDate}
                            </span>
                            {(kegiatan.waktu_mulai || kegiatan.waktu_selesai) && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 shadow-sm">
                                    <Clock size={15} />
                                    {kegiatan.waktu_mulai || '00:00'} - {kegiatan.waktu_selesai || 'Selesai'} WIB
                                </span>
                            )}
                        </div>

                        {/* Line Divider */}
                        <div className="border-t border-slate-100 my-6"></div>

                        {/* Description */}
                        <div className="prose max-w-none text-slate-600 leading-relaxed text-base whitespace-pre-wrap font-normal">
                            {kegiatan.deskripsi || 'Tidak ada deskripsi untuk kegiatan ini.'}
                        </div>

                        {/* Line Divider */}
                        <div className="border-t border-slate-100 my-8"></div>

                        {/* Link to Instagram */}
                        <div className="flex justify-center sm:justify-start">
                            <a 
                                href="https://instagram.com/tumbuhberbagi" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <svg size={16} fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                                </svg>
                                <span>Lihat Dokumentasi Lengkap di Instagram</span>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </SiswaLayout>
    );
}
