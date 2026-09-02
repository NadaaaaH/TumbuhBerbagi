import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FaqItem from './FaqItem';

const faqs = [
    {
        q: "Apa saja program pembelajaran di sini?",
        a: "Kami menyediakan mentoring intensif UTBK/SNBT, latihan soal terstruktur, tryout berkala, serta kelas pengembangan diri. Semua program dirancang mengikuti kurikulum dan tipe soal terbaru."
    },
    {
        q: "Bagaimana sistem mentoringnya?",
        a: "Siswa akan dikelompokkan bersama mentor berprestasi. Sesi mentoring diadakan secara berkala baik kelompok maupun personal untuk membahas materi dan kendala belajar."
    },
    {
        q: "Siapa saja mentor yang mengajar?",
        a: "Mentor kami berasal dari mahasiswa dan alumni universitas ternama (PTN) yang memiliki rekam jejak akademis luar biasa dan berdedikasi tinggi."
    },
    {
        q: "Apakah saya bisa mengatur jadwal belajar sendiri?",
        a: "Ya, Anda bisa mengakses bank soal latihan kapan saja melalui sistem e-learning kami, serta memilih sesi mentoring sesuai waktu luang Anda."
    }
];

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="pt-20 pb-4 bg-[#fafbfc] border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* LEFT COLUMN: Header & Contact Banner */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-['Poppins'] text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-4">
                                FAQ
                            </h2>
                            <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
                                Pertanyaan yang paling sering diajukan seputar program Tumbuh Berbagi.
                            </p>
                        </motion.div>

                        {/* "Pertanyaan Lain?" Soft Yellow Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="rounded-[2rem] flex flex-col items-start gap-4   "
                        >
                            <h3 className="font-['Poppins'] text-2xl font-extrabold text-slate-800">
                                Pertanyaan Lain?
                            </h3>
                            <a
                                href="mailto:admin@tumbuhberbagi.id"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#fcc526] hover:bg-[#fef8e7] text-[#ffffff] hover:text-[#d99b00] border border-[#f5e6c4] hover:border-[#ebd59b] font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 mt-2"
                            >
                                Hubungi Kami <ArrowRight size={16} />
                            </a>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: FAQ Accordion Stack */}
                    <div className="lg:col-span-7 space-y-4">
                        {faqs.map((faq, i) => (
                            <FaqItem
                                key={i}
                                question={faq.q}
                                answer={faq.a}
                                index={i}
                                isOpen={openIndex === i}
                                onToggle={() => toggleFaq(i)}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
