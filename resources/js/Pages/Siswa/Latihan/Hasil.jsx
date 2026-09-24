import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, ArrowRight, Trophy, CheckCircle2, XCircle, Clock, Info, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '@/Components/PrimaryButton';
import TertiaryButton from '@/Components/TertiaryButton';
import ContainerGreen from '@/Components/ContainerGreen';
import ContainerWhite from '@/Components/ContainerWhite';
import FirstIcon from '@/Components/FirstIcon';
import NavigasiPembahasan from './Partials/NavigasiPembahasan';
import PembahasanCard from './Partials/PembahasanCard';

function mapKategoriToTab(kategori) {
    const k = (kategori || '').trim();
    const lower = k.toLowerCase();

    if (k === 'PU' || lower === 'penalaran umum' || (lower.includes('penalaran') && lower.includes('umum'))) {
        return 'PU';
    }
    if (
        k === 'PPU' ||
        (lower.includes('pemahaman') && lower.includes('umum')) ||
        (lower.includes('pengetahuan') && lower.includes('umum'))
    ) {
        return 'PPU';
    }
    if (k === 'PBM' || (lower.includes('bacaan') && lower.includes('menulis'))) {
        return 'PBM';
    }
    if (k === 'PK' || lower.includes('kuantitatif')) {
        return 'PK';
    }
    if (
        k === 'LBI' ||
        lower === 'literasi bahasa indonesia' ||
        (lower.includes('indonesia') && lower.includes('literasi')) ||
        lower.includes('bahasa indonesia')
    ) {
        return 'LBI';
    }
    if (
        k === 'LBE' ||
        k === 'LBIng' ||
        lower === 'literasi bahasa inggris' ||
        lower.includes('inggris') ||
        lower.includes('english') ||
        lower.includes('bahasa inggris')
    ) {
        return 'LBE';
    }
    if (k === 'PM' || lower.includes('matematika')) {
        return 'PM';
    }
    if (lower.includes('literasi')) {
        return 'LBI';
    }

    return k || 'Umum';
}

export default function Hasil({ auth, paket, sesi, hasil, jawabanSiswa, questionStats, peringkat, totalPeserta, rataRata, nilaiTertinggi }) {
    const [activeTab, setActiveTab] = useState('statistik'); // 'statistik' or 'pembahasan'
    const [pembahasanIndex, setPembahasanIndex] = useState(0);
    const [filterKategori, setFilterKategori] = useState('Semua');
    const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
    const [activeChartTab, setActiveChartTab] = useState('Semua');

    const enrichedStats = useMemo(() => {
        return (questionStats || []).map((stat, idx) => ({
            ...stat,
            globalIndex: idx,
            kategoriCode: mapKategoriToTab(stat.kategori),
        }));
    }, [questionStats]);

    const chartTabs = useMemo(() => {
        const STANDARD_TABS = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];
        const presentCodes = new Set(enrichedStats.map(s => s.kategoriCode));
        const ordered = STANDARD_TABS.filter(t => presentCodes.has(t));
        presentCodes.forEach(t => {
            if (!STANDARD_TABS.includes(t)) ordered.push(t);
        });
        return ['Semua', ...ordered];
    }, [enrichedStats]);

    const displayedStats = useMemo(() => {
        if (activeChartTab === 'Semua') {
            return enrichedStats;
        }
        return enrichedStats.filter(s => s.kategoriCode === activeChartTab);
    }, [enrichedStats, activeChartTab]);

    const soals = useMemo(() => {
        if (paket?.soal && paket.soal.length > 0) {
            return paket.soal;
        }
        return (jawabanSiswa || []).map((j) => {
            const soalFromPaket = paket?.soal?.find((s) => s.id_soal === j.id_soal);
            return {
                ...(j.soal || {}),
                ...(soalFromPaket || {}),
                pilihan_jawaban:
                    (soalFromPaket?.pilihan_jawaban && soalFromPaket.pilihan_jawaban.length > 0)
                        ? soalFromPaket.pilihan_jawaban
                        : (j.soal?.pilihan_jawaban || []),
            };
        });
    }, [paket?.soal, jawabanSiswa]);

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

            {/* Navigation & Tab Selection: Tombol Kembali di kiri, Tab Statistik & Pembahasan di kanan */}
            <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
                {/* Kiri: Tombol Kembali menggunakan PrimaryButton */}
                <Link href={route('siswa.latihan.index')}>
                    <PrimaryButton className="gap-2 px-5 py-2.5 text-sm font-semibold shadow-md">
                        <ArrowLeft size={16} />
                        Kembali
                    </PrimaryButton>
                </Link>

                {/* Kanan: Tab Statistik & Pembahasan menggunakan TertiaryButton */}
                <div className="flex items-center gap-2.5">
                    <TertiaryButton
                        type="button"
                        onClick={() => setActiveTab('statistik')}
                        className={`!px-5 !py-2.5 !text-sm !font-semibold transition-all ${activeTab === 'statistik'
                            ? '!bg-[#fcc526] hover:!bg-[#eab522] !text-white !border-[#fcc526] shadow-md'
                            : ''
                            }`}
                    >
                        Statistik Hasil
                    </TertiaryButton>
                    <TertiaryButton
                        type="button"
                        onClick={() => setActiveTab('pembahasan')}
                        className={`!px-5 !py-2.5 !text-sm !font-semibold transition-all ${activeTab === 'pembahasan'
                            ? '!bg-[#fcc526] hover:!bg-[#eab522] !text-white !border-[#fcc526] shadow-md'
                            : ''
                            }`}
                    >
                        Pembahasan Soal
                    </TertiaryButton>
                </div>
            </div>

            {activeTab === 'statistik' ? (
                <div className="space-y-8 animate-fade-in">

                    {/* 3-Column Summary Cards Row */}
                    <div className="grid gap-6 md:grid-cols-3 items-stretch">
                        {/* Left Column: Stacked Cards (Total Nilai & Peringkat) */}
                        <div className="flex flex-col gap-4">
                            {/* Card Total Nilai */}
                            <ContainerGreen className="flex-1 flex flex-col justify-between !p-5 sm:!p-6 cursor-default">
                                <div className="relative z-10 flex justify-between items-start">
                                    <span className="text-base font-bold text-emerald-100">Total Nilai</span>
                                    <FirstIcon
                                        icon={Trophy}
                                        iconSize={18}
                                        className="!w-10 !h-10 !rounded-xl !bg-[#fcc526] !text-slate-900 shadow-md group-hover:!bg-[#eab522] group-hover:!text-slate-950"
                                    />
                                </div>
                                <div className="relative z-10 mt-1 flex items-baseline">
                                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">{totalNilai}</span>
                                    <span className="text-emerald-100/70 text-sm ml-2 font-bold">/ 1000</span>
                                </div>
                                <div className="relative z-10 mt-3 pt-2.5 border-t border-emerald-400/20 flex justify-between text-xs font-semibold text-emerald-100/80">
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Rata-rata: {rataRata}</span>
                                    <span className="flex items-center gap-1"><Trophy size={12} /> Tertinggi: {nilaiTertinggi}</span>
                                </div>
                            </ContainerGreen>

                            {/* Card Peringkat */}
                            <ContainerWhite className="!py-3.5 !px-5 sm:!px-6 flex items-center justify-between hover:-translate-y-1 transition-all duration-300 cursor-default">
                                <div className="flex flex-col relative z-10">
                                    <span className="text-base font-bold text-slate-700">Peringkat Anda</span>
                                    <div className="mt-0.5 flex items-baseline">
                                        <span className="text-3xl sm:text-4xl font-black text-slate-800 group-hover:text-[#1b5e20] transition-colors">{peringkat}</span>
                                        <span className="text-slate-400 text-xs sm:text-sm ml-1.5 font-semibold">dari {totalPeserta}</span>
                                    </div>
                                </div>
                                <FirstIcon icon={Award} iconSize={22} className="!w-11 !h-11 !rounded-xl" />
                            </ContainerWhite>
                        </div>

                        {/* Middle Column: Accuracy Card */}
                        <ContainerWhite className="h-full flex flex-col justify-between !p-5 sm:!p-6 hover:-translate-y-1 transition-all duration-300 cursor-default">
                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-base font-bold text-slate-700">Akurasi Soal</span>
                                <FirstIcon icon={CheckCircle2} iconSize={22} className="!w-11 !h-11 !rounded-xl" />
                            </div>
                            <div className="my-auto py-3 relative z-10">
                                <div className="flex items-end gap-2">
                                    <div className="text-6xl sm:text-7xl font-black text-slate-800 tracking-tighter">{hasil.jumlah_benar}</div>
                                    <div className="text-2xl font-bold text-slate-400 mb-2">/ {hasil.total_soal}</div>
                                </div>
                                <div className="text-sm text-slate-500 mt-1.5 font-medium">Soal dijawab dengan benar</div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                    <span>Tingkat Akurasi</span>
                                    <span className="text-[#1b5e20] font-black">{Math.round((hasil.jumlah_benar / (hasil.total_soal || 1)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                                    <div
                                        className="bg-[#1b5e20] h-full rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${(hasil.jumlah_benar / (hasil.total_soal || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </ContainerWhite>

                        {/* Right Column: Duration Card */}
                        <ContainerWhite className="h-full flex flex-col justify-between !p-5 sm:!p-6 hover:-translate-y-1 transition-all duration-300 cursor-default">
                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-base font-bold text-slate-700">Waktu Pengerjaan</span>
                                <FirstIcon icon={Clock} iconSize={22} className="!w-11 !h-11 !rounded-xl" />
                            </div>
                            <div className="my-auto py-3 relative z-10">
                                <div className="text-2xl sm:text-3xl font-black text-[#1b5e20] leading-tight tracking-tight whitespace-nowrap">{duration}</div>
                                <div className="text-sm text-slate-500 mt-2 font-medium">Total waktu yang dihabiskan pada sesi ini</div>
                            </div>
                            <div className="relative z-10 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#fcc526]"></span> Mulai</span>
                                    <span className="font-semibold text-slate-700">{sesi?.waktu_mulai ? new Date(sesi.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20]"></span> Selesai</span>
                                    <span className="font-semibold text-slate-700">{sesi?.waktu_selesai ? new Date(sesi.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                </div>
                            </div>
                        </ContainerWhite>
                    </div>

                    {/* Subtest Analysis Card */}
                    <ContainerWhite className="!p-6 md:!p-8">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analisis Per Kategori</h2>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Rincian performa Anda di setiap materi uji</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
                            {categoryStats.map((stat, i) => {
                                const percentage = Math.round((stat.benar / (stat.total || 1)) * 100);
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">
                                                {stat.name}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-sm sm:text-base font-black text-[#1b5e20]">
                                                    {stat.benar}
                                                </span>
                                                <span className="text-xs sm:text-sm font-bold text-slate-400">
                                                    /{stat.total}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400 ml-1">
                                                    ({percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ContainerWhite>

                    {/* Participant Performance Chart Card */}
                    <ContainerWhite className="!p-6 md:!p-8">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Akurasi Seluruh Peserta per Soal</h2>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Persentase peserta yang menjawab benar untuk setiap nomor soal</p>
                            </div>

                            {/* Subtest Filter Tabs: Berpindah subtes agar rapi dan tidak perlu scroll jauh */}
                            {chartTabs.length > 2 && (
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
                                    {chartTabs.map((tab) => {
                                        const isActive = activeChartTab === tab;
                                        const count = tab === 'Semua' 
                                            ? enrichedStats.length 
                                            : enrichedStats.filter(s => s.kategoriCode === tab).length;

                                        return (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => {
                                                    setActiveChartTab(tab);
                                                    setHoveredBarIndex(null);
                                                }}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-[#1b5e20] text-white shadow-xs'
                                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                }`}
                                            >
                                                <span>{tab}</span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs font-semibold text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                            <div className="flex flex-wrap items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-[#10B981] block shadow-xs"></span>
                                    <span>Persentase Benar</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-[#94A3B8] block shadow-xs"></span>
                                    <span>Persentase Tidak Mengisi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-[#EF4444] block shadow-xs"></span>
                                    <span>Persentase Salah</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#10B981] font-black text-sm">#1</span>
                                    <span className="text-slate-500">Teks Hijau: Jawaban Anda Benar</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#94A3B8] font-black text-sm">#2</span>
                                    <span className="text-slate-500">Teks Abu: Tidak Mengisi</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#EF4444] font-black text-sm">#3</span>
                                    <span className="text-slate-500">Teks Merah: Jawaban Anda Salah</span>
                                </div>
                            </div>
                        </div>

                        {/* Diagram Container: Align Kiri (justify-start gap-8 sm:gap-10) tanpa gap berlebih ke atas */}
                        <div className="overflow-x-auto md:overflow-visible pb-4 pt-1">
                            <div className="h-64 sm:h-72 relative min-w-full px-4">

                                {/* Grid lines background: diletakkan di area bar (top-6 bottom-12) */}
                                <div className="absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between pointer-events-none">
                                    {[100, 75, 50, 25, 0].map((val) => (
                                        <div key={val} className="w-full flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-slate-400 w-8 text-right shrink-0">{val}%</span>
                                            <div className="flex-1 border-t border-dashed border-slate-200/70"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Container: Align kiri dengan gap rapi */}
                                <div className="absolute inset-x-0 top-6 bottom-12 flex items-end justify-start gap-8 sm:gap-10 pl-16 pr-8">
                                    {displayedStats.map((stat, indexInDisplayed) => {
                                        const i = stat.globalIndex;
                                        const userJawaban = jawabanSiswa.find(j => j.id_soal === stat.id_soal);
                                        const isUserCorrect = userJawaban?.is_benar;
                                        const isUserAnswered = userJawaban && (userJawaban.id_pilihan !== null || (userJawaban.teks_jawaban !== null && userJawaban.teks_jawaban !== ''));

                                        const jumlahBenar = stat.jumlah_benar || 0;
                                        const jumlahSalah = stat.jumlah_salah || 0;
                                        const jumlahKosong = stat.jumlah_kosong || 0;
                                        const total = jumlahBenar + jumlahSalah + jumlahKosong;

                                        const pctBenar = total > 0 ? (jumlahBenar / total) * 100 : 0;
                                        const pctKosong = total > 0 ? (jumlahKosong / total) * 100 : 0;
                                        const pctSalah = total > 0 ? Math.max(0, 100 - pctBenar - pctKosong) : 0;

                                        const accuracy = total > 0 ? Math.round(pctBenar) : 0;
                                        const isHovered = hoveredBarIndex === i;

                                        const isFirst = indexInDisplayed === 0;
                                        const isLast = indexInDisplayed === displayedStats.length - 1 && displayedStats.length > 2;

                                        let tooltipAlign = "left-1/2 -translate-x-1/2";
                                        let arrowAlign = "mx-auto";
                                        if (isFirst) {
                                            tooltipAlign = "left-0 -translate-x-2";
                                            arrowAlign = "ml-4";
                                        } else if (isLast) {
                                            tooltipAlign = "right-0 translate-x-2";
                                            arrowAlign = "mr-4";
                                        }

                                        return (
                                            <div
                                                key={stat.id_soal}
                                                className="flex flex-col items-center relative h-full w-12 sm:w-14 shrink-0 cursor-pointer group"
                                                onMouseEnter={() => setHoveredBarIndex(i)}
                                                onMouseLeave={() => setHoveredBarIndex(null)}
                                            >
                                                {/* Tooltip Popup: Absolute, estetik ringkas, langsung di atas batang yang dihover */}
                                                <AnimatePresence>
                                                    {isHovered && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                                            transition={{ duration: 0.15 }}
                                                            className={`absolute bottom-[calc(100%+6px)] ${tooltipAlign} z-50 w-48 pointer-events-none text-center`}
                                                        >
                                                            <div className="bg-white text-slate-800 rounded-2xl p-2.5 shadow-xl border border-slate-200 ring-4 ring-black/5">
                                                                <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-100">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="font-extrabold text-slate-900 text-xs">Soal #{i + 1}</span>
                                                                        <span className="text-[9px] font-bold text-white bg-[#fcc526] px-1.5 py-0.2 rounded shadow-2xs">
                                                                            {stat.kategoriCode}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-black text-[#10B981]">
                                                                        {accuracy}% <span className="text-[9px] font-medium text-slate-400">Benar</span>
                                                                    </span>
                                                                </div>

                                                                {/* Rincian Berapa Orang Benar, Salah, dan Tidak Mengisi */}
                                                                <div className="grid grid-cols-3 divide-x divide-slate-100 my-1 py-1 border-b border-slate-100 text-center">
                                                                    <div className="px-0.5">
                                                                        <span className="text-xs font-black text-[#10B981] block leading-none">{jumlahBenar}</span>
                                                                        <span className="text-[9px] text-slate-500 font-medium">Benar</span>
                                                                    </div>
                                                                    <div className="px-0.5">
                                                                        <span className="text-xs font-black text-[#EF4444] block leading-none">{jumlahSalah}</span>
                                                                        <span className="text-[9px] text-slate-500 font-medium">Salah</span>
                                                                    </div>
                                                                    <div className="px-0.5">
                                                                        <span className="text-xs font-black text-[#94A3B8] block leading-none">{jumlahKosong}</span>
                                                                        <span className="text-[9px] text-slate-500 font-medium whitespace-nowrap">Kosong</span>
                                                                    </div>
                                                                </div>

                                                                {/* Status Jawaban Siswa */}
                                                                <div className="pt-0.5 flex items-center justify-between text-[9.5px]">
                                                                    <span className="text-slate-400 font-medium">{total} Peserta</span>
                                                                    <span className={`font-bold inline-flex items-center gap-0.5 ${
                                                                        isUserCorrect 
                                                                            ? 'text-[#10B981]' 
                                                                            : (!isUserAnswered ? 'text-slate-400' : 'text-[#EF4444]')
                                                                    }`}>
                                                                        {isUserCorrect ? '✓ Benar' : (!isUserAnswered ? '— Kosong' : '✗ Salah')}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Segitiga Panah Putih Tooltip */}
                                                            <div className={`w-2.5 h-2.5 bg-white border-b border-r border-slate-200 rotate-45 ${arrowAlign} -mt-1.5 shadow-2xs`} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Bar: Ramping (w-5 sm:w-6), Stacked: Hijau (bawah), Abu (tengah), Merah (atas) */}
                                                <div className={`w-5 sm:w-6 rounded-full h-full flex flex-col justify-end relative overflow-hidden shadow-inner border border-slate-100 transition-all duration-200 ${isHovered ? 'scale-105 ring-2 ring-slate-800/20 shadow-md brightness-105' : ''} bg-slate-100`}>
                                                    {/* Merah: Salah (paling atas) */}
                                                    {pctSalah > 0 && (
                                                        <motion.div
                                                            initial={{ height: "0%" }}
                                                            animate={{ height: `${pctSalah}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                            className="w-full bg-[#EF4444] shrink-0"
                                                        />
                                                    )}
                                                    {/* Abu-abu: Tidak Mengisi (di tengah, di antara merah dan hijau) */}
                                                    {pctKosong > 0 && (
                                                        <motion.div
                                                            initial={{ height: "0%" }}
                                                            animate={{ height: `${pctKosong}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                            className="w-full bg-[#94A3B8] shrink-0"
                                                        />
                                                    )}
                                                    {/* Hijau: Benar (paling bawah) */}
                                                    {pctBenar > 0 && (
                                                        <motion.div
                                                            initial={{ height: "0%" }}
                                                            animate={{ height: `${pctBenar}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                            className="w-full bg-[#10B981] shrink-0"
                                                        />
                                                    )}
                                                </div>

                                                {/* X-Label: Nomor Soal + Di Bawahnya Tulisan Kategori sebagai Pembeda */}
                                                <div className={`absolute top-full mt-2 flex flex-col items-center text-center transition-all ${isHovered ? 'scale-110' : ''}`}>
                                                    <span className={`text-xs font-black transition-colors ${
                                                        isUserCorrect 
                                                            ? 'text-[#10B981]' 
                                                            : (!isUserAnswered ? 'text-slate-400' : 'text-[#EF4444]')
                                                    }`}>
                                                        #{i + 1}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 px-1.5 py-0.5 rounded-md border transition-colors ${
                                                        isHovered 
                                                            ? 'bg-slate-800 text-white border-slate-800 shadow-2xs' 
                                                            : 'bg-slate-100 text-slate-500 border-slate-200/50'
                                                    }`}>
                                                        {stat.kategoriCode}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </ContainerWhite>
                </div>
            ) : (
                /* Pembahasan Detail View (Mirip Ujian / Interaktif) */
                soals.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                        Tidak ada soal untuk pembahasan ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
                        {/* DESKTOP ONLY: Kolom Kiri - Navigasi Pembahasan (Sticky) */}
                        <div className="hidden lg:block lg:col-span-4 sticky top-28 self-start z-30">
                            <NavigasiPembahasan
                                soals={soals}
                                jawabanSiswa={jawabanSiswa}
                                activeIndex={pembahasanIndex}
                                onNavigate={setPembahasanIndex}
                            />
                        </div>

                        {/* ALWAYS: Kolom Kanan - Kartu Soal & Pembahasan */}
                        <div className="lg:col-span-8">
                            <PembahasanCard
                                soal={soals[pembahasanIndex]}
                                jawaban={jawabanSiswa[pembahasanIndex]}
                                soalIndex={pembahasanIndex}
                                totalSoal={soals.length}
                                onPrev={() => setPembahasanIndex((i) => Math.max(0, i - 1))}
                                onNext={() => setPembahasanIndex((i) => Math.min(soals.length - 1, i + 1))}
                            />
                        </div>

                        {/* MOBILE ONLY: Navigasi Pembahasan di Bawah */}
                        <div className="block lg:hidden w-full">
                            <NavigasiPembahasan
                                soals={soals}
                                jawabanSiswa={jawabanSiswa}
                                activeIndex={pembahasanIndex}
                                onNavigate={setPembahasanIndex}
                            />
                        </div>
                    </div>
                )
            )}
        </SiswaLayout>
    );
}
