import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, ArrowRight, Trophy, CheckCircle2, XCircle, Clock, Info, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hasil({ auth, paket, sesi, hasil, jawabanSiswa, questionStats, peringkat, totalPeserta, rataRata, nilaiTertinggi }) {
    const [activeTab, setActiveTab] = useState('statistik'); // 'statistik' or 'pembahasan'
    const [filterKategori, setFilterKategori] = useState('Semua');

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

    const kategoriList = useMemo(() => {
        const cats = jawabanSiswa.map(j => j.soal?.kategori || 'Umum');
        return ['Semua', ...Array.from(new Set(cats))];
    }, [jawabanSiswa]);

    const filteredJawaban = useMemo(() => {
        if (filterKategori === 'Semua') return jawabanSiswa;
        return jawabanSiswa.filter(j => (j.soal?.kategori || 'Umum') === filterKategori);
    }, [jawabanSiswa, filterKategori]);

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
                            <div className="bg-gradient-to-br from-[#1b5e20] to-[#0a2e10] text-white rounded-[2rem] p-6 shadow-xl shadow-[#1b5e20]/20 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl -ml-10 -mb-10"></div>
                                
                                <div className="relative z-10 flex justify-between items-start">
                                    <span className="text-sm font-semibold text-emerald-100">Total Nilai</span>
                                    <Trophy size={18} className="text-emerald-300 drop-shadow-md" />
                                </div>
                                <div className="relative z-10 mt-2 flex items-baseline">
                                    <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">{totalNilai}</span>
                                    <span className="text-emerald-100/70 text-sm ml-2 font-bold">/ 1000</span>
                                </div>
                                <div className="relative z-10 mt-4 pt-3 border-t border-emerald-400/20 flex justify-between text-xs font-semibold text-emerald-100/80">
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Rata-rata: {rataRata}</span>
                                    <span className="flex items-center gap-1"><Trophy size={12}/> Tertinggi: {nilaiTertinggi}</span>
                                </div>
                            </div>
                            
                            {/* Card Peringkat */}
                            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-6 shadow-lg shadow-slate-200/40 flex items-center justify-between min-h-[120px] hover:shadow-xl transition-all duration-300 group hover:border-[#1b5e20]/30 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 relative overflow-hidden">
                                <div className="flex flex-col relative z-10">
                                    <span className="text-sm font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">Peringkat Anda</span>
                                    <div className="mt-1 flex items-baseline">
                                        <span className="text-4xl font-black text-slate-800 group-hover:text-[#1b5e20] transition-colors">{peringkat}</span>
                                        <span className="text-slate-400 text-sm ml-1.5 font-semibold">dari {totalPeserta}</span>
                                    </div>
                                    <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1b5e20] group-hover:text-white group-hover:shadow-md group-hover:-rotate-12 transition-all duration-300 relative z-10">
                                    <Award size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Accuracy Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-6 shadow-lg shadow-slate-200/40 flex flex-col justify-between min-h-[280px] hover:shadow-xl hover:border-emerald-200/60 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute -right-20 -top-20 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-sm font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">Akurasi Soal</span>
                                <span className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={24} />
                                </span>
                            </div>
                            <div className="my-auto py-4 relative z-10">
                                <div className="flex items-end gap-2">
                                    <div className="text-7xl font-black text-slate-800 tracking-tighter">{hasil.jumlah_benar}</div>
                                    <div className="text-2xl font-bold text-slate-400 mb-2">/ {hasil.total_soal}</div>
                                </div>
                                <div className="text-sm text-slate-500 mt-2 font-medium">Soal dijawab dengan benar</div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                    <span>Tingkat Akurasi</span>
                                    <span className="text-emerald-600">{Math.round((hasil.jumlah_benar / (hasil.total_soal || 1)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                                    <div 
                                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 ease-out relative" 
                                        style={{ width: `${(hasil.jumlah_benar / (hasil.total_soal || 1)) * 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Duration Card */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-6 shadow-lg shadow-slate-200/40 flex flex-col justify-between min-h-[280px] hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-sm font-semibold text-slate-500 group-hover:text-blue-700 transition-colors">Waktu Pengerjaan</span>
                                <span className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Clock size={24} />
                                </span>
                            </div>
                            <div className="my-auto py-4 relative z-10">
                                <div className="text-4xl sm:text-5xl font-black text-slate-800 leading-tight tracking-tight">{duration}</div>
                                <div className="text-sm text-slate-500 mt-3 font-medium">Total waktu yang dihabiskan pada sesi ini</div>
                            </div>
                            <div className="relative z-10 bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Mulai</span>
                                    <span className="text-slate-800">{sesi?.waktu_mulai ? new Date(sesi.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Selesai</span>
                                    <span className="text-slate-800">{sesi?.waktu_selesai ? new Date(sesi.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subtest Analysis Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 md:p-8">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analisis Per Kategori</h2>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Rincian performa Anda di setiap materi uji</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
                                <CheckCircle2 size={16} /> Total Benar
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {categoryStats.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                                            <Trophy size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{stat.name}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                                        <span className="text-lg font-black text-slate-800">{stat.benar}</span>
                                        <span className="text-xs font-bold text-slate-400">/ {stat.total}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Participant Performance Chart Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-slate-850 font-['Poppins']">Akurasi Seluruh Peserta per Soal</h2>
                            <p className="text-sm text-slate-500">Persentase peserta yang menjawab benar untuk setiap nomor soal</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 mb-8 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-emerald-500 block shadow-sm"></span>
                                <span>Persentase Benar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-rose-500 block shadow-sm"></span>
                                <span>Persentase Salah</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-emerald-600 font-bold">#1</span>
                                <span>Teks Hijau: Anda Benar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-rose-600 font-bold">#2</span>
                                <span>Teks Merah: Anda Salah</span>
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
                                            <div key={stat.id_soal} className="flex flex-col items-center group relative w-12 h-full">
                                                {/* Tooltip */}
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 w-36 text-center">
                                                    <div className="bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700/50">
                                                        <p className="font-bold text-slate-200 mb-1">Soal #{i + 1}</p>
                                                        <p className="text-emerald-400 font-bold">{accuracy}% Benar</p>
                                                        <p className="text-slate-400 text-[10px] mt-0.5">({stat.jumlah_benar} Benar, {stat.jumlah_salah} Salah)</p>
                                                    </div>
                                                </div>

                                                {/* Bar Container */}
                                                <div className={`w-10 sm:w-12 rounded-t-xl h-full flex items-end relative overflow-hidden shadow-inner border border-slate-200/40 ${total > 0 ? 'bg-gradient-to-b from-rose-500 to-rose-400' : 'bg-slate-100/80'}`}>
                                                    <motion.div
                                                        initial={{ height: "0%" }}
                                                        animate={{ height: `${accuracy}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
                                                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 relative z-10"
                                                    ></motion.div>
                                                </div>

                                                {/* X-Label */}
                                                <span className={`absolute top-full mt-2 text-xs font-bold transition-colors ${isUserCorrect ? 'text-emerald-600 group-hover:text-emerald-700' : 'text-rose-600 group-hover:text-rose-700'}`}>#{i + 1}</span>
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-850 font-['Poppins']">Pembahasan Soal</h2>
                                <p className="text-slate-500 text-sm mt-1">Pelajari kembali soal-soal latihan ini untuk mengasah kemampuan Anda.</p>
                            </div>
                            {/* Filter Kategori */}
                            <div className="flex flex-wrap gap-2">
                                {kategoriList.map((kat) => (
                                    <button
                                        key={kat}
                                        onClick={() => setFilterKategori(kat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                                            filterKategori === kat
                                                ? 'bg-[#1b5e20] text-white border-[#1b5e20] shadow-md shadow-[#1b5e20]/20'
                                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                                        }`}
                                    >
                                        {kat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {filterKategori !== 'Semua' && (
                            <div className="mt-3 text-xs text-slate-400 font-medium">
                                Menampilkan <span className="font-bold text-slate-600">{filteredJawaban.length}</span> soal kategori <span className="font-bold text-emerald-700">{filterKategori}</span>
                            </div>
                        )}
                    </div>

                    {filteredJawaban.map((jawaban, idx) => {
                        const soal = jawaban.soal;
                        const benar = jawaban.is_benar;
                        return (
                            <div key={jawaban.id_jawaban} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-3">
                                            Soal #{idx + 1} - Kategori: {soal?.kategori || 'Umum'}
                                        </span>
                                        <div 
                                            className="text-base font-semibold text-slate-800 leading-relaxed prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                                            dangerouslySetInnerHTML={{ __html: soal?.konten_soal }}
                                        />
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
                                    {soal?.pembahasan ? (
                                        <div 
                                            className="text-slate-600 prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                                            dangerouslySetInnerHTML={{ __html: soal.pembahasan }}
                                        />
                                    ) : (
                                        <p className="text-slate-500 italic">Pembahasan belum disediakan.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </SiswaLayout>
    );
}
