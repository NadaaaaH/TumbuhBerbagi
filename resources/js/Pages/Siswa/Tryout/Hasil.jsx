import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, ArrowRight, Trophy, CheckCircle2, XCircle, Clock, Info, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hasil({ auth, paket, sesi, hasil, jawabanSiswa = [], questionStats = [], peringkat, totalPeserta, rataRata, nilaiTertinggi }) {
    const [activeTab, setActiveTab] = useState('statistik');
    const [filterKategori, setFilterKategori] = useState('Semua');

    const totalNilai = useMemo(() => {
        return Math.round((hasil?.nilai_akhir || 0) * 10);
    }, [hasil?.nilai_akhir]);

    const duration = useMemo(() => {
        const actualSesi = sesi || {};
        if (!actualSesi.waktu_mulai || !actualSesi.waktu_selesai) return '-';
        const start = new Date(actualSesi.waktu_mulai);
        const end = new Date(actualSesi.waktu_selesai);
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 1000 / 60);
        const diffSecs = Math.floor((diffMs / 1000) % 60);
        if (diffMins === 0) {
            return `${diffSecs} detik`;
        }
        return `${diffMins} menit ${diffSecs} detik`;
    }, [sesi]);

    const categoryStats = useMemo(() => {
        const stats = {};
        (jawabanSiswa || []).forEach((jawaban) => {
            const cat = jawaban.soal?.kategori || 'Umum';
            if (!stats[cat]) {
                stats[cat] = { total: 0, benar: 0 };
            }
            stats[cat].total += 1;
            if (jawaban.is_benar) {
                stats[cat].benar += 1;
            }
        });
        return Object.keys(stats).map((cat) => ({
            name: cat,
            score: Math.round((stats[cat].benar / stats[cat].total) * 100),
            benar: stats[cat].benar,
            total: stats[cat].total,
        }));
    }, [jawabanSiswa]);

    const categories = useMemo(() => {
        const cats = new Set(['Semua']);
        (questionStats || []).forEach(q => {
            if (q.kategori) cats.add(q.kategori);
        });
        return Array.from(cats);
    }, [questionStats]);

    const filteredQuestions = useMemo(() => {
        if (filterKategori === 'Semua') return questionStats || [];
        return (questionStats || []).filter(q => q.kategori === filterKategori);
    }, [questionStats, filterKategori]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
    };

    return (
        <SiswaLayout user={auth.user} header="Hasil Try Out">
            <Head title={`Hasil Try Out - ${paket.nama_paket}`} />

            <div className="space-y-8 pb-16">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('siswa.tryout.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1b5e20] transition-colors"
                    >
                        <ArrowLeft size={16} /> Kembali ke Daftar Try Out
                    </Link>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8"
                >
                    {/* Top Hero Banner */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gradient-to-br from-[#1b5e20] via-[#236b28] to-[#124216] text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                        <div className="space-y-3 z-10 text-center md:text-left">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-[#fcc526] text-xs font-bold border border-amber-400/30">
                                <Trophy size={14} /> Try Out Selesai
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold font-['Poppins'] tracking-tight">
                                {paket.nama_paket}
                            </h1>
                            <p className="text-white/70 text-sm font-light max-w-lg">
                                Selamat! Anda telah menyelesaikan simulasi Try Out ini. Pelajari statistik dan pembahasan di bawah ini untuk meningkatkan skor Anda.
                            </p>
                        </div>

                        {/* Score Display Card */}
                        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] text-center min-w-[200px] shadow-inner">
                            <p className="text-xs uppercase font-bold tracking-wider text-white/70 mb-1">Skor Akhir</p>
                            <p className="text-5xl md:text-6xl font-black text-[#fcc526] font-['Poppins'] drop-shadow-md">
                                {totalNilai}
                            </p>
                            <p className="text-xs text-white/80 mt-2 font-medium">dari {hasil.total_soal} Soal</p>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <motion.div variants={itemVariants} className="flex border-b border-slate-200 gap-8">
                        <button
                            onClick={() => setActiveTab('statistik')}
                            className={`pb-4 text-sm font-bold transition-all relative ${
                                activeTab === 'statistik'
                                    ? 'text-[#1b5e20]'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Statistik & Analisis
                            {activeTab === 'statistik' && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#1b5e20] rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('pembahasan')}
                            className={`pb-4 text-sm font-bold transition-all relative ${
                                activeTab === 'pembahasan'
                                    ? 'text-[#1b5e20]'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Pembahasan Soal
                            {activeTab === 'pembahasan' && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#1b5e20] rounded-full" />
                            )}
                        </button>
                    </motion.div>

                    {/* Tab 1: Statistik */}
                    {activeTab === 'statistik' && (
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Jawaban Benar</p>
                                        <p className="text-2xl font-extrabold text-slate-800">{hasil.jumlah_benar}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <XCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Jawaban Salah</p>
                                        <p className="text-2xl font-extrabold text-slate-800">{hasil.jumlah_salah}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Peringkat Anda</p>
                                        <p className="text-2xl font-extrabold text-slate-800">#{peringkat} <span className="text-xs font-medium text-slate-400">/ {totalPeserta}</span></p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Durasi Ujian</p>
                                        <p className="text-lg font-extrabold text-slate-800">{duration}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 font-['Poppins']">Analisis Per Subtes / Kategori</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {categoryStats.map((cat) => (
                                        <div key={cat.name} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-semibold">
                                                <span className="text-slate-700">{cat.name}</span>
                                                <span className="text-[#1b5e20]">{cat.benar} / {cat.total} Benar ({cat.score}%)</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[#1b5e20] rounded-full transition-all duration-500"
                                                    style={{ width: `${cat.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Tab 2: Pembahasan Soal */}
                    {activeTab === 'pembahasan' && (
                        <motion.div variants={itemVariants} className="space-y-6">
                            {/* Filter Categories */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterKategori(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                            filterKategori === cat
                                                ? 'bg-[#1b5e20] text-white shadow-sm'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Question List with Pembahasan */}
                            <div className="space-y-4">
                                {filteredQuestions.map((q, idx) => {
                                    const jawabanUser = (jawabanSiswa || []).find(j => j.id_soal === q.id_soal);
                                    const isCorrect = jawabanUser?.is_benar;

                                    return (
                                        <div 
                                            key={q.id_soal}
                                            className={`bg-white p-6 md:p-7 rounded-[2rem] border transition-all ${
                                                isCorrect
                                                    ? 'border-emerald-200/80 bg-emerald-50/10'
                                                    : 'border-red-200/80 bg-red-50/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                                                        {q.kategori || 'Umum'}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                                    isCorrect ? 'bg-emerald-100 text-[#1b5e20]' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                    {isCorrect ? 'Benar' : 'Salah'}
                                                </span>
                                            </div>

                                            <div className="text-slate-800 text-sm font-medium leading-relaxed mb-4 prose max-w-none">
                                                {q.konten_soal}
                                            </div>

                                            {/* Pembahasan Box */}
                                            {q.pembahasan ? (
                                                <div className="mt-4 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-slate-800 space-y-2">
                                                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                                                        <Info size={16} /> Pembahasan & Kunci Jawaban
                                                    </div>
                                                    <p className="text-xs leading-relaxed text-slate-700 font-normal">
                                                        {q.pembahasan}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mt-4 p-4 rounded-2xl bg-slate-50 text-slate-400 text-xs font-medium italic">
                                                    Belum ada penjelasan pembahasan untuk soal ini.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </SiswaLayout>
    );
}
