import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: "Beasiswa Mentoring",
        desc: "Dapatkan bimbingan dan pendampingan eksklusif dari mentor mahasiswa berprestasi yang siap membagikan pengalaman belajarnya."
    },
    {
        icon: BookOpen,
        title: "Latihan Soal Ujian",
        desc: "Akses bank soal UTBK SNBT, pembahasan rinci, serta pelacakan performa skor secara real-time untuk memantau kemajuan Anda."
    },
    {
        icon: TrendingUp,
        title: "Lingkungan Suportif",
        desc: "Bergabung bersama ratusan penerima beasiswa Tumbuh Berbagi lainnya dalam lingkungan yang saling memotivasi dan mendukung."
    },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function FiturSection() {
    return (
        <section id="fitur" className="py-28 bg-[#f8fafc] relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center max-w-2xl mx-auto mb-20"
                >
                    <span className="text-[#1b5e20] text-xs font-bold uppercase tracking-wider block mb-2">Fasilitas Belajar</span>
                    <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-[#1a2530]">Materi & Dukungan Akademik</h2>
                    <p className="text-slate-500 font-light mt-3 leading-relaxed">
                        Fitur komprehensif dirancang khusus guna melatih mental serta kemampuan akademis menuju jenjang PTN yang ditargetkan.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }
                            }}
                            whileHover={{ y: -8 }}
                            className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(27,94,32,0.06)] hover:border-[#1b5e20]/10 transition-all duration-500"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-[#1b5e20] mb-8 group-hover:scale-110 group-hover:bg-[#1b5e20] group-hover:text-white transition-all duration-500 shadow-sm">
                                <feature.icon size={26} />
                            </div>
                            <h3 className="font-['Poppins'] font-bold text-xl text-slate-800 mb-4 group-hover:text-[#1b5e20] transition-colors">{feature.title}</h3>
                            <p className="text-slate-500 font-light text-sm sm:text-base leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
