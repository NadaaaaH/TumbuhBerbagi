import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, ArrowRight, Trophy, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hasil({ auth, paket, sesi, hasil, jawabanSiswa, questionStats, peringkat, totalPeserta, rataRata, nilaiTertinggi }) {
    const [activeTab, setActiveTab] = useState('statistik'); // 'statistik' or 'pembahasan'

    const totalNilai = useMemo(() => {
        return Math.round((hasil.nilai_akhir || 0) * 10);
    }, [hasil.nilai_akhir]);

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
        jawabanSiswa.forEach((jawaban) => {
            const cat = jawaban.soal?.kategori || 'Umum';
            if (!stats[cat]) {
                stats[cat] = { total: 0, benar: 0 };
            }
            stats[cat].total += 1;
            if (jawaban.is_benar) {
                stats[cat].benar += 1;
            }
        });
        return Object.entries(stats).map(([name, data]) => ({
            name,
            total: data.total,
            benar: data.benar,
        }));
    }, [jawabanSiswa]);

    return (
        <SiswaLayout user={auth.user} header={paket.nama_paket}>
            <Head title={`Hasil ${paket.nama_paket}`} />

            {/* Navigation & Tab Selection */}
            <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('statistik')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'statistik'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Statistik Hasil
                    </button>
                    <button
                        onClick={() => setActiveTab('pembahasan')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'pembahasan'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Pembahasan Soal
                    </button>
                </div>

                <Link
                    href={route('siswa.latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium bg-white px-4 py-2.5 rounded-xl border border-slate-200"
                >
                    <ArrowLeft size={16} />
                    Kembali
                </Link>
            </div>

            {activeTab === 'statistik' ? (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* 3-Column Summary Cards Row */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Left Column: Stacked Cards (Total Nilai & Peringkat) */}
                        <div className="flex flex-col gap-6">
                            {/* Card Total Nilai */}
                            <div className="bg-[#e0e0e0] text-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden border border-slate-300">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-semibold text-slate-650">Total Nilai</span>
                                    <Info size={16} className="text-slate-500" />
                                </div>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-5xl font-bold text-slate-900">{totalNilai}</span>
                                    <span className="text-slate-650 text-sm ml-2 font-semibold">/ 1000</span>
                                </div>
                                {/* Perbandingan Nilai */}
                                <div className="mt-4 pt-3 border-t border-slate-300 flex justify-between text-xs text-slate-600 font-bold">
                                    <span>Rata-rata: {rataRata}</span>
                                    <span>Tertinggi: {nilaiTertinggi}</span>
                                </div>
                            </div>
                            
                            {/* Card Peringkat */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between min-h-[120px] hover:border-slate-300 transition-all">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-500">Peringkat</span>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-4xl font-bold text-slate-800">{peringkat}</span>
                                        <span className="text-slate-400 text-sm ml-1">/ {totalPeserta}</span>
                                    </div>
                                    <div className="w-12 h-1 bg-slate-200 rounded-full mt-2"></div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Accuracy Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[280px]">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-semibold text-slate-500">Akurasi Soal</span>
                                <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                    <CheckCircle2 size={20} />
                                </span>
                            </div>
                            <div className="my-auto py-4">
                                <div className="text-6xl font-bold text-slate-800">{hasil.jumlah_benar}</div>
                                <div className="text-sm text-slate-500 mt-1 font-semibold">dari {hasil.total_soal} soal dijawab benar</div>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-slate-400 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${(hasil.jumlah_benar / (hasil.total_soal || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Right Column: Duration Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[280px]">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-semibold text-slate-500">Waktu Pengerjaan</span>
                                <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                    <Clock size={20} />
                                </span>
                            </div>
                            <div className="my-auto py-4">
                                <div className="text-4xl font-bold text-slate-800 leading-tight">{duration}</div>
                                <div className="text-sm text-slate-500 mt-1 font-semibold">waktu pengerjaan sesi ini</div>
                            </div>
                            <div className="text-xs text-slate-400 border-t border-slate-100 pt-3 flex justify-between">
                                <span>Mulai: {sesi?.waktu_mulai ? new Date(sesi.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span>Selesai: {sesi?.waktu_selesai ? new Date(sesi.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subtest Analysis Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-850 font-['Poppins']">Analisis Per Subtes / Kategori</h2>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Benar</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {categoryStats.map((stat, i) => (
                                <div key={i} className="flex justify-between items-center py-4">
                                    <span className="text-sm font-semibold text-slate-700">{stat.name}</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {stat.benar} <span className="text-slate-400 font-normal">/ {stat.total}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Participant Performance Chart Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-slate-850 font-['Poppins']">Akurasi Seluruh Peserta per Soal</h2>
                            <p className="text-sm text-slate-500">Persentase peserta yang menjawab benar untuk setiap nomor soal</p>
                        </div>
                        
                        <div className="flex gap-6 mb-8 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-emerald-500 block shadow-sm"></span>
                                <span>Jawaban Anda Benar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-rose-500 block shadow-sm"></span>
                                <span>Jawaban Anda Salah</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-4 pt-6">
                            <div className="h-72 relative min-w-[600px] px-2">
                                
                                {/* Grid lines background */}
                                <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                                    {[100, 75, 50, 25, 0].map((val) => (
                                        <div key={val} className="w-full flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{val}%</span>
                                            <div className="flex-1 border-t border-dashed border-slate-200/60"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Container */}
                                <div className="absolute inset-x-0 top-0 bottom-8 flex items-end justify-start gap-8 pl-10 pr-4">
                                    {questionStats.map((stat, i) => {
                                        const userJawaban = jawabanSiswa.find(j => j.id_soal === stat.id_soal);
                                        const isUserCorrect = userJawaban?.is_benar;
                                        const total = stat.jumlah_benar + stat.jumlah_salah;
                                        const accuracy = total > 0 ? Math.round((stat.jumlah_benar / total) * 100) : 0;
                                        
                                        return (
                                            <div key={stat.id_soal} className="flex flex-col items-center group relative w-12">
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center pointer-events-none z-20 w-48 text-center">
                                                    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed">
                                                        <p className="font-bold text-slate-200 mb-1">Soal #{i + 1}</p>
                                                        <p className="line-clamp-2 mb-1 text-slate-300">{stat.konten_soal}</p>
                                                        <p className="text-emerald-400 font-bold">{accuracy}% Peserta Benar</p>
                                                        <p className="text-slate-400">({stat.jumlah_benar} dari {total} peserta)</p>
                                                    </div>
                                                    <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 shadow-lg"></div>
                                                </div>

                                                {/* Bar Container */}
                                                <div className="w-10 sm:w-12 bg-slate-100/80 rounded-t-xl h-full flex items-end relative overflow-hidden shadow-inner border border-slate-200/40">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${accuracy}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
                                                        className={`w-full rounded-t-xl transition-all duration-300 ${
                                                            isUserCorrect 
                                                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300' 
                                                                : 'bg-gradient-to-t from-rose-500 to-rose-400 group-hover:from-rose-400 group-hover:to-rose-300'
                                                        }`}
                                                    ></motion.div>
                                                </div>

                                                {/* X-Label */}
                                                <span className="absolute top-full mt-2 text-xs font-bold text-slate-400 group-hover:text-slate-800 transition-colors">#{i + 1}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Pembahasan Detail View */
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-850 font-['Poppins']">Pembahasan Soal</h2>
                        <p className="text-slate-500 text-sm mt-1">Pelajari kembali soal-soal latihan ini untuk mengasah kemampuan Anda.</p>
                    </div>

                    {jawabanSiswa.map((jawaban, idx) => {
                        const soal = jawaban.soal;
                        const benar = jawaban.is_benar;
                        return (
                            <div key={jawaban.id_jawaban} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-3">
                                            Soal #{idx + 1} - Kategori: {soal?.kategori || 'Umum'}
                                        </span>
                                        <div className="text-base font-semibold text-slate-800 leading-relaxed">{soal?.konten_soal}</div>
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm whitespace-nowrap self-start ${benar ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                        {benar ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {benar ? 'Benar' : 'Salah'}
                                    </div>
                                </div>

                                {soal?.jenis_soal === 'pilihan_ganda' ? (
                                    <div className="mt-6 space-y-2">
                                        {soal.pilihan_jawaban?.map((pilihan) => {
                                            const isSelected = pilihan.id_pilihan === jawaban.id_pilihan;
                                            const isCorrectKey = pilihan.kode_pilihan.toUpperCase() === soal.kunci_jawaban.toUpperCase();
                                            
                                            let borderClass = "border-slate-200 bg-white hover:bg-slate-50";
                                            let textClass = "text-slate-700";
                                            let badge = null;

                                            if (isSelected && isCorrectKey) {
                                                borderClass = "border-emerald-300 bg-emerald-50/50";
                                                textClass = "text-emerald-800 font-semibold";
                                                badge = <span className="ml-auto px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold shadow-sm">Jawaban Anda (Benar)</span>;
                                            } else if (isSelected && !isCorrectKey) {
                                                borderClass = "border-rose-300 bg-rose-50/50";
                                                textClass = "text-rose-800 font-semibold";
                                                badge = <span className="ml-auto px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-bold shadow-sm">Jawaban Anda (Salah)</span>;
                                            } else if (isCorrectKey) {
                                                borderClass = "border-emerald-300 bg-emerald-50/20";
                                                textClass = "text-emerald-700 font-semibold";
                                                badge = <span className="ml-auto px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold shadow-sm">Kunci Jawaban</span>;
                                            }

                                            return (
                                                <div key={pilihan.id_pilihan} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all ${borderClass} ${textClass}`}>
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {pilihan.kode_pilihan}
                                                    </span>
                                                    <span>{pilihan.teks_pilihan}</span>
                                                    {badge}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-3">
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm">
                                            <div className="text-slate-400 font-semibold mb-1">Jawaban Anda:</div>
                                            <div className="text-slate-800 font-bold">{jawaban.teks_jawaban || '-'}</div>
                                        </div>
                                        <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100 text-sm">
                                            <div className="text-emerald-600 font-semibold mb-1">Kunci Jawaban:</div>
                                            <div className="text-emerald-800 font-bold">{soal?.kunci_jawaban}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 rounded-2xl bg-[#fafafa] border border-slate-200 p-5 text-sm text-slate-700 leading-relaxed shadow-sm">
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                                        <Info size={16} className="text-slate-500" />
                                        Pembahasan
                                    </div>
                                    <p className="text-slate-600 whitespace-pre-wrap">{soal?.pembahasan || 'Pembahasan belum disediakan.'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </SiswaLayout>
    );
}
