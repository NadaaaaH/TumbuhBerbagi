import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { Calendar, ArrowRight } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function KegiatanSection({ kegiatans, onSelectKegiatan }) {
    return (
        <section id="kegiatan" className="py-28 bg-white border-t border-slate-100 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Informasi Kegiatan</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">Berita dan aktivitas terbaru dari komunitas Tumbuh Berbagi.</p>
                </motion.div>
            </div>

            <div className="w-full relative px-6 md:px-12 max-w-7xl mx-auto">
                {kegiatans && kegiatans.length > 0 ? (
                    <>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={24}
                            centeredSlides={true}
                            loop={true}
                            slidesPerView={1.1}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            breakpoints={{
                                640: { slidesPerView: 1.1 },
                                1024: { slidesPerView: 1.15 },
                                1280: { slidesPerView: 1.2 }
                            }}
                            navigation={{
                                prevEl: '.swiper-button-prev-custom',
                                nextEl: '.swiper-button-next-custom',
                            }}
                            className="!pb-16"
                        >
                            {kegiatans.map((kegiatan) => (
                                <SwiperSlide key={kegiatan.id_kegiatan}>
                                    {({ isActive }) => (
                                        <button
                                            onClick={() => isActive && onSelectKegiatan(kegiatan)}
                                            className={`text-left w-full transition-all duration-700 bg-white rounded-[3rem] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row group gap-8 p-8 sm:min-h-[400px] h-full ${isActive
                                                ? 'opacity-100 scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] cursor-pointer hover:-translate-y-1'
                                                : 'opacity-40 scale-[0.96] blur-[2px] cursor-default pointer-events-none'
                                            }`}
                                        >
                                            <div className="w-full sm:w-[440px] h-72 sm:h-auto rounded-[2rem] overflow-hidden relative flex-shrink-0 bg-slate-50 border border-slate-100/40">
                                                {kegiatan.gambar_url ? (
                                                    <img
                                                        src={kegiatan.gambar_url}
                                                        alt={kegiatan.nama_kegiatan}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#f8f9fa] text-slate-300">
                                                        <Calendar size={64} opacity={0.3} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-2 pl-2 pr-2">
                                                <div>
                                                    <div className="mb-5">
                                                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 shadow-sm">
                                                            <Calendar size={12} className="text-[#1b5e20]" />
                                                            {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-slate-800 mb-4 group-hover:text-[#1b5e20] transition-colors leading-tight">
                                                        {kegiatan.nama_kegiatan}
                                                    </h3>
                                                    <p className="text-slate-500 font-light text-sm sm:text-base line-clamp-3 sm:line-clamp-5 leading-relaxed mb-6">
                                                        {kegiatan.deskripsi}
                                                    </p>
                                                </div>
                                                <div className="mt-auto">
                                                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-[#1b5e20]/30 transition-all group/btn shadow-sm active:scale-95">
                                                        <span>Baca Selengkapnya</span>
                                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Navigation Controls */}
                        <div className="absolute top-[50%] -translate-y-1/2 left-0 w-full flex justify-between px-2 sm:px-10 pointer-events-none z-10">
                            <button className="swiper-button-prev-custom pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100/80 flex items-center justify-center text-slate-500 hover:bg-[#1b5e20] hover:text-white hover:border-[#1b5e20] transition-all transform hover:scale-105 active:scale-95">
                                <ArrowRight className="rotate-180" size={20} />
                            </button>
                            <button className="swiper-button-next-custom pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100/80 flex items-center justify-center text-slate-500 hover:bg-[#1b5e20] hover:text-white hover:border-[#1b5e20] transition-all transform hover:scale-105 active:scale-95">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 mx-auto max-w-4xl px-6 shadow-sm">
                        <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 text-lg">Belum ada informasi kegiatan.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
