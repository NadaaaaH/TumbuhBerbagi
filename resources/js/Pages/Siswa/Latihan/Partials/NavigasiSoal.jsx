import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomScrollbar from '@/Components/CustomScrollbar';

/**
 * Pemetaan kategori soal ke dalam tab UTBK:
 * PU, PPU, PBM, PK, LBI, LBE, PM
 */
function mapKategoriToTab(kategori) {
    const k = (kategori || '').trim();
    const lower = k.toLowerCase();

    // 1. PU (Penalaran Umum)
    if (k === 'PU' || lower === 'penalaran umum' || (lower.includes('penalaran') && lower.includes('umum'))) {
        return 'PU';
    }

    // 2. PPU (Pengetahuan & Pemahaman Umum)
    if (
        k === 'PPU' ||
        (lower.includes('pemahaman') && lower.includes('umum')) ||
        (lower.includes('pengetahuan') && lower.includes('umum'))
    ) {
        return 'PPU';
    }

    // 3. PBM (Pemahaman Bacaan & Menulis)
    if (k === 'PBM' || (lower.includes('bacaan') && lower.includes('menulis'))) {
        return 'PBM';
    }

    // 4. PK (Pengetahuan Kuantitatif)
    if (k === 'PK' || lower.includes('kuantitatif')) {
        return 'PK';
    }

    // 5. LBI (Literasi Bahasa Indonesia)
    if (
        k === 'LBI' ||
        lower === 'literasi bahasa indonesia' ||
        (lower.includes('indonesia') && lower.includes('literasi')) ||
        lower.includes('bahasa indonesia')
    ) {
        return 'LBI';
    }

    // 6. LBE (Literasi Bahasa Inggris)
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

    // 7. PM (Penalaran Matematika)
    if (k === 'PM' || lower.includes('matematika')) {
        return 'PM';
    }

    // Fallback literasi
    if (lower.includes('literasi')) {
        return 'LBI';
    }

    return k || 'Umum';
}

/**
 * NavigasiSoal
 * - Tab horizontal satu baris: PU, PPU, PBM, PK, LBI, LBE, PM
 * - Transisi geser lembut (soft sliding animation dengan framer-motion)
 * - Tombol nomor sebelum diisi tanpa background (hanya border hijau tipis)
 * - Scrollbar di bagian atas tanpa sela kuning di bawah tab aktif
 * - Tanpa scrollbar vertikal di samping grid soal
 */
export default function NavigasiSoal({
    soals = [],
    activeIndex = 0,
    jawaban = {},
    raguRagu = {},
    processing = false,
    onNavigate,
    onKirim,
}) {
    // Kumpulan tab yang tersedia (hanya kategori yang memiliki soal pada paket ini)
    const tabs = useMemo(() => {
        const STANDARD_TABS = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];

        // Kumpulkan kategori yang ada soalnya di paket ini
        const presentTabs = new Set();
        soals.forEach((s) => {
            const mapped = mapKategoriToTab(s.kategori);
            presentTabs.add(mapped);
        });

        // Urutkan sesuai standar UTBK (hanya kategori yang ada soalnya)
        const ordered = STANDARD_TABS.filter((tab) => presentTabs.has(tab));

        // Tambahkan kategori kustom lainnya jika ada (yang ada soalnya)
        presentTabs.forEach((tab) => {
            if (!STANDARD_TABS.includes(tab)) {
                ordered.push(tab);
            }
        });

        return ordered;
    }, [soals]);

    // Inisialisasi tab aktif sesuai soal yang sedang dibuka
    const [activeTab, setActiveTab] = useState(() => {
        const initialMapped = mapKategoriToTab(soals[activeIndex]?.kategori);
        return tabs.includes(initialMapped) ? initialMapped : (tabs[0] || '');
    });

    const activeTabRef = useRef(null);
    const topScrollRef = useRef(null);
    const tabsScrollRef = useRef(null);
    const isSyncingTop = useRef(false);
    const isSyncingTabs = useRef(false);
    const [contentWidth, setContentWidth] = useState(600);

    // Hitung lebar konten untuk sinkronisasi scrollbar atas
    useEffect(() => {
        const updateWidth = () => {
            if (tabsScrollRef.current) {
                setContentWidth(tabsScrollRef.current.scrollWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        const timer = setTimeout(updateWidth, 100);
        return () => {
            window.removeEventListener('resize', updateWidth);
            clearTimeout(timer);
        };
    }, [tabs, soals]);

    // Sinkronisasi scroll dari scrollbar atas ke deretan tab
    const handleTopScroll = () => {
        if (!isSyncingTop.current && tabsScrollRef.current && topScrollRef.current) {
            isSyncingTabs.current = true;
            tabsScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
            requestAnimationFrame(() => {
                isSyncingTabs.current = false;
            });
        }
    };

    // Sinkronisasi scroll dari deretan tab ke scrollbar atas
    const handleTabsScroll = () => {
        if (!isSyncingTabs.current && topScrollRef.current && tabsScrollRef.current) {
            isSyncingTop.current = true;
            topScrollRef.current.scrollLeft = tabsScrollRef.current.scrollLeft;
            requestAnimationFrame(() => {
                isSyncingTop.current = false;
            });
        }
    };

    const prevActiveIndexRef = useRef(activeIndex);

    // Otomatis sinkronkan tab aktif HANYA ketika nomor soal berpindah (misal tombol Sebelumnya / Berikutnya)
    useEffect(() => {
        if (prevActiveIndexRef.current !== activeIndex) {
            prevActiveIndexRef.current = activeIndex;
            const currentMapped = mapKategoriToTab(soals[activeIndex]?.kategori);
            if (currentMapped && tabs.includes(currentMapped)) {
                setActiveTab(currentMapped);
            }
        }
    }, [activeIndex, soals, tabs]);

    // Handle klik tab kategori bebas
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        const currentMapped = mapKategoriToTab(soals[activeIndex]?.kategori);
        if (currentMapped !== tab) {
            const firstIdx = soals.findIndex((s) => mapKategoriToTab(s.kategori) === tab);
            if (firstIdx !== -1 && onNavigate) {
                onNavigate(firstIdx);
            }
        }
    };

    // Auto-scroll tab aktif ke posisi terlihat
    useEffect(() => {
        if (activeTabRef.current && tabsScrollRef.current) {
            const tabEl = activeTabRef.current;
            const container = tabsScrollRef.current;
            const left = tabEl.offsetLeft - 16;
            container.scrollTo({ left, behavior: 'smooth' });
        }
    }, [activeTab]);

    // Filter soal yang ditampilkan di grid sesuai tab yang aktif
    const displayedQuestions = useMemo(() => {
        return soals
            .map((soal, originalIdx) => ({ soal, originalIdx }))
            .filter(({ soal }) => {
                if (tabs.length <= 1) return true;
                const mapped = mapKategoriToTab(soal.kategori);
                return mapped === activeTab;
            });
    }, [soals, activeTab, tabs]);

    return (
        <ContainerWhite className="w-full !p-0 overflow-hidden shadow-sm">
            {/* Header: Bersih tanpa background abu-abu */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-white">
                <div>
                    <h3 className="font-extrabold text-[#1a2530] text-base tracking-tight">
                        Navigasi Soal
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Pilih nomor untuk melihat soal
                    </p>
                </div>
                <span className="text-xl font-bold text-[#1b5e20] px-2.5 py-1 rounded-full shadow-xs">
                    {soals.length} Soal
                </span>
            </div>

            {/* Tab Bar dengan Background Kuning (#fcc526) - Hanya muncul jika ada lebih dari 1 kategori soal */}
            {tabs.length > 1 && (
                <div className="bg-[#fcc526]">
                    {/* 1. Scrollbar DI ATAS menggunakan CustomScrollbar */}
                    <div className="px-3 pt-2">
                        <CustomScrollbar
                            ref={topScrollRef}
                            direction="horizontal"
                            theme="amber"
                            className="h-2 w-full cursor-pointer"
                            onScroll={handleTopScroll}
                        >
                            <div style={{ width: `${contentWidth}px`, height: '1px' }} />
                        </CustomScrollbar>
                    </div>

                    {/* 2. Deretan Tab DI BAWAH scrollbar, menempel langsung ke card putih tanpa sela kuning */}
                    <div
                        ref={tabsScrollRef}
                        onScroll={handleTabsScroll}
                        className="px-3 pt-1.5 flex items-end gap-1.5 overflow-x-auto no-scrollbar"
                    >
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            const tabSoals = soals.filter(
                                (s) => mapKategoriToTab(s.kategori) === tab
                            );
                            const answeredCount = tabSoals.filter(
                                (s) =>
                                    jawaban[s.id_soal] !== undefined &&
                                    jawaban[s.id_soal] !== ''
                            ).length;
                            const hasRaguInTab = tabSoals.some(
                                (s) => Boolean(raguRagu[s.id_soal])
                            );

                            return (
                                <button
                                    key={tab}
                                    ref={isActive ? activeTabRef : null}
                                    type="button"
                                    onClick={() => handleTabClick(tab)}
                                    className={`px-4 py-2.5 rounded-t-xl text-xs flex items-center gap-1.5 whitespace-nowrap relative shrink-0 transition-colors duration-200 cursor-pointer ${isActive
                                        ? 'bg-white text-slate-900 font-black shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-10'
                                        : 'text-slate-900/85 hover:text-slate-950 hover:bg-black/5 font-extrabold'
                                        }`}
                                >
                                    {/* Active indicator: Transisi meluncur lembut antar tab */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavTabIndicator"
                                            className="absolute inset-0 bg-white rounded-t-xl shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-0 pointer-events-none"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}

                                    <span className="relative z-10 pointer-events-none flex items-center gap-1.5">
                                        <span>{tab}</span>
                                        {hasRaguInTab && (
                                            <span
                                                className="w-2 h-2 rounded-full bg-[#1b5e20] ring-1.5 ring-white shrink-0 shadow-xs"
                                                title="Ada soal ragu-ragu di subtes ini"
                                            />
                                        )}
                                    </span>
                                    <span
                                        className={`relative z-10 pointer-events-none text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${isActive
                                            ? 'bg-slate-100 text-slate-700'
                                            : 'bg-black/10 text-slate-900'
                                            }`}
                                    >
                                        {answeredCount}/{tabSoals.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Konten Utama Navigasi: Latar Putih (Menyatu langsung dengan tab aktif) */}
            <div className="p-5 sm:p-6 bg-white overflow-hidden">
                {/* Grid Nomor Soal dengan animasi geser lembut */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="grid grid-cols-5 gap-2.5"
                    >
                        {displayedQuestions.length > 0 ? (
                            displayedQuestions.map(({ soal, originalIdx }) => {
                                const isCurrent = originalIdx === activeIndex;
                                const isAnswered =
                                    jawaban[soal.id_soal] !== undefined &&
                                    jawaban[soal.id_soal] !== '';
                                const isRagu = Boolean(raguRagu[soal.id_soal]);

                                let btnClass =
                                    'h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 relative ';

                                if (isRagu) {
                                    // 3. Ragu-ragu (baik sudah dijawab maupun belum dijawab): warna kuning (#fcc526)
                                    btnClass +=
                                        'bg-[#fcc526] hover:bg-[#eab522] text-white border border-[#fcc526] shadow-xs ';
                                    if (isCurrent) {
                                        btnClass +=
                                            'ring-2 ring-offset-2 ring-[#fcc526] font-black scale-[1.03] ';
                                    }
                                } else if (isAnswered) {
                                    // 1. Sudah dijawab: warna hijau
                                    btnClass +=
                                        'bg-[#1b5e20] hover:bg-[#144718] text-white border border-[#1b5e20] shadow-xs ';
                                    if (isCurrent) {
                                        btnClass +=
                                            'ring-2 ring-offset-2 ring-[#1b5e20] font-black scale-[1.03] ';
                                    }
                                } else if (isCurrent) {
                                    // 2. Belum dijawab tapi sedang aktif: latar putih dengan border hijau tema
                                    btnClass +=
                                        'bg-white border-2 border-[#1b5e20] text-[#1b5e20] font-black shadow-xs ring-2 ring-[#1b5e20]/20 ';
                                } else {
                                    // 2. Belum dijawab dan tidak aktif: tanpa background, border hijau primary (#1b5e20) tipis
                                    btnClass +=
                                        'bg-transparent hover:bg-[#1b5e20]/5 text-slate-700 hover:text-[#1b5e20] border border-[#1b5e20] ';
                                }

                                return (
                                    <button
                                        key={soal.id_soal}
                                        type="button"
                                        onClick={() => onNavigate(originalIdx)}
                                        className={btnClass}
                                    >
                                        {originalIdx + 1}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="col-span-5 text-center py-8 text-xs text-slate-400 font-medium">
                                Tidak ada soal di kategori ini.
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>



                {/* Legenda Warna */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-md bg-[#1b5e20] shrink-0 shadow-xs" />
                        <span>Sudah Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-md bg-[#fcc526] shrink-0 shadow-xs" />
                        <span>Ragu-Ragu</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Belum Dijawab: Border hijau primary tipis tanpa background */}
                        <span className="w-3.5 h-3.5 rounded-md border border-[#1b5e20] bg-transparent shrink-0" />
                        <span>Belum Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Soal Aktif */}
                        <span className="w-3.5 h-3.5 rounded-md border-2 border-[#1b5e20] bg-white ring-1 ring-[#1b5e20]/20 shrink-0" />
                        <span>Soal Aktif</span>
                    </div>
                </div>

                {/* Tombol Kirim Jawaban menggunakan PrimaryButton */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                    <PrimaryButton
                        type="button"
                        onClick={onKirim}
                        disabled={processing}
                        className="w-full py-3.5 gap-2 text-sm font-bold shadow-md"
                    >
                        <Send size={15} />
                        Kirim Jawaban
                    </PrimaryButton>
                </div>
            </div>
        </ContainerWhite>
    );
}
