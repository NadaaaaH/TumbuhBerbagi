import React from 'react';
import { motion } from 'framer-motion';
import FaqItem from './FaqItem';

const faqs = [
    {
        q: "Siapa saja yang bisa mengakses portal ini?",
        a: "Portal ini eksklusif untuk penerima beasiswa mentoring Tumbuh Berbagi. Akun akan dibuatkan oleh admin setelah proses seleksi selesai."
    },
    {
        q: "Bagaimana cara mendapatkan akun?",
        a: "Kamu harus mendaftar dan lolos seleksi program beasiswa Tumbuh Berbagi. Informasi pendaftaran bisa dilihat di media sosial resmi kami."
    },
    {
        q: "Fitur apa saja yang tersedia di dalam dashboard?",
        a: "Setelah login, kamu bisa mengakses latihan soal SNBT, menjadwalkan mentoring, memantau progress belajar, serta melihat pengumuman kegiatan terbaru."
    },
    {
        q: "Apakah saya bisa mengubah jadwal mentoring yang sudah dipilih?",
        a: "Bisa, kamu dapat mengajukan perubahan jadwal mentoring melalui dashboard maksimal 24 jam sebelum sesi dimulai."
    }
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function FaqSection() {
    return (
        <section id="faq" className="py-28 bg-[#f8fafc] border-t border-slate-100">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <span className="text-[#1b5e20] text-xs font-bold uppercase tracking-wider block mb-2">Hubungi Bantuan</span>
                    <h2 className="font-['Poppins'] text-3xl font-extrabold text-[#1a2530]">Pertanyaan yang Sering Diajukan</h2>
                    <p className="text-slate-500 font-light mt-2 leading-relaxed">Cari tahu jawaban dari pertanyaan umum mengenai akses e-learning dan kegiatan beasiswa.</p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
