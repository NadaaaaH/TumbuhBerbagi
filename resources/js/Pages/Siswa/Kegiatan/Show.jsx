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

            {/* Split Grid matching wireframe */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start relative max-w-5xl mx-auto pt-4">
                
                {/* Left Column (Sticky Rectangular Image / Swiper Carousel) */}
                <div className="md:col-span-5 md:sticky md:top-28 z-0">
                    <div className="rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 bg-white aspect-[4/3] w-full relative">
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
                </div>

                {/* Right Column (Scrollable Text) */}
                <div className="md:col-span-7 space-y-6">
                    <div>
                        {/* Title */}
                        <h1 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
                            {kegiatan.nama_kegiatan}
                        </h1>

                        {/* Date and Time metadata, styled cleanly in-line */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-semibold mb-6">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                {formattedDate}
                            </span>
                            {(kegiatan.waktu_mulai || kegiatan.waktu_selesai) && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={16} />
                                    {kegiatan.waktu_mulai || '00:00'} - {kegiatan.waktu_selesai || 'Selesai'} WIB
                                </span>
                            )}
                        </div>

                        {/* Line Divider */}
                        <div className="border-t border-slate-100 my-6"></div>

                        {/* Description */}
                        <div className="prose max-w-none text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                            {kegiatan.deskripsi || 'Tidak ada deskripsi untuk kegiatan ini.'}
                        </div>
                    </div>
                </div>

            </div>
        </SiswaLayout>
    );
}
