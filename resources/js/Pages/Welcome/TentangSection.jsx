import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { value: '500+', label: 'Peserta Aktif', color: 'text-slate-900' },
    { value: '50+',  label: 'Mentor Ahli',   color: 'text-slate-900' },
    { value: '3',    label: 'Tahun Aktif',   color: 'text-slate-900' },
    { value: '98%',  label: 'Lolos Seleksi PTN', color: 'text-[#1b5e20]' },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function TentangSection() {
    return (
        <section id="tentang" className="py-28 bg-white relative">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="space-y-8"
                >
                    <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2530] leading-tight max-w-3xl mx-auto">
                        Mengantarkan Langkahmu Menuju{' '}
                        <span className="text-[#1b5e20] bg-emerald-50 px-2 rounded-lg">Gerbang PTN.</span>
                    </h2>
                    <p className="text-slate-500 font-light text-base sm:text-lg mb-12 leading-relaxed max-w-3xl mx-auto">
                        Tumbuh Berbagi bukan sekadar wadah beasiswa belajar biasa. Kami percaya kolaborasi, mentoring berdedikasi, serta akses fasilitas penunjang yang setara adalah kunci penting membimbing generasi berpotensi meraih impian besar masa depan mereka.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-100">
                        {stats.map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <p className={`text-4xl sm:text-5xl font-extrabold font-['Poppins'] ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
