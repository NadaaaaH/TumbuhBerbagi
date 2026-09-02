import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Heart, ArrowUpRight } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: "Pendamping Mentoring",
        desc: "Modul dan bimbingan mentoring yang terstruktur sesuai materi ujian terbaru, dipandu langsung oleh mentor berpengalaman.",
        offsetClass: "lg:translate-x-6",
    },
    {
        icon: BookOpen,
        title: "Latihan Soal",
        desc: "Latihan soal ujian komprehensif dengan pembahasan detail untuk melatih kemampuan menyelesaikan berbagai tipe soal ujian.",
        offsetClass: "lg:translate-x-0",
    },
    {
        icon: Heart,
        title: "Lingkungan Kooperatif",
        desc: "Platform belajar hangat dan suportif bersama teman-teman seperjuangan untuk saling berbagi ilmu dan terus memotivasi.",
        offsetClass: "lg:translate-x-6",
    },
];

export default function FiturSection() {
    return (
        <section id="fitur" className="py-20 bg-[#fafbfc] relative overflow-hidden">
            {/* Background Decorative Blur Blobs */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Left Column: Siluet Wisudawan & Animated Title */}
                    <div className="lg:col-span-6 flex flex-row items-center gap-6 sm:gap-8 justify-center lg:justify-start">
                        {/* Animated Silhouette Logo */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="flex-shrink-0 relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-[#1b5e20]/10 rounded-full blur-2xl group-hover:bg-[#1b5e20]/20 transition-all" />
                            <img
                                src="/images/logo3.svg"
                                alt="Tumbuh Berbagi Logo"
                                className="relative w-[145px] h-[195px] sm:w-[185px] sm:h-[250px] md:w-[215px] md:h-[290px] object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                            />
                        </motion.div>

                        {/* Title Text */}
                        <div className="text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="font-['Poppins'] text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
                                    Bersama<br />
                                    <span className="text-[#1b5e20]">
                                        Tumbuh<br />Berbagi
                                    </span>
                                </h2>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Feature Cards like FAQ Cards */}
                    <div className="lg:col-span-6 flex flex-col gap-6 w-full">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                whileHover={{ y: -6, scale: 1.015 }}
                                className={`w-full max-w-xl self-center lg:self-start ${feature.offsetClass}`}
                            >
                                <div className="group p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer">
                                    <div className="flex items-start gap-5">
                                        {/* Yellow Icon Badge like FAQ */}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#fef8e7] text-[#d99b00] group-hover:bg-[#fcc526] group-hover:text-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                            <feature.icon size={22} strokeWidth={2.2} />
                                        </div>

                                        {/* Card Text Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <h3 className="font-['Poppins'] font-bold text-lg sm:text-xl text-slate-800 group-hover:text-[#1b5e20] transition-colors leading-tight">
                                                    {feature.title}
                                                </h3>
                                                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-[#d99b00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                                            </div>
                                            <p className="text-slate-500 font-light text-sm sm:text-base leading-relaxed">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
