import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContainerWhite from '@/Components/ContainerWhite';
import CustomScrollbar from '@/Components/CustomScrollbar';

/**
 * Pemetaan kategori soal ke dalam tab UTBK:
 * PU, PPU, PBM, PK, LBI, LBE, PM
 */
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

export default function NavigasiPembahasan({
    soals = [],
    jawabanSiswa = [],
    activeIndex = 0,
    onNavigate,
}) {
    // Map jawaban by soal id for easy lookup
    const jawabanMap = useMemo(() => {
        const map = {};
        jawabanSiswa.forEach((j) => {
            map[j.id_soal] = j;
        });
        return map;
    }, [jawabanSiswa]);

    // Kumpulan tab yang tersedia (hanya kategori yang memiliki soal pada paket ini)
    const tabs = useMemo(() => {
        const STANDARD_TABS = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];
        const presentTabs = new Set();
        soals.forEach((s) => {
            const mapped = mapKategoriToTab(s.kategori);
            presentTabs.add(mapped);
        });

        const ordered = STANDARD_TABS.filter((tab) => presentTabs.has(tab));
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

    const handleTopScroll = () => {
        if (!isSyncingTop.current && tabsScrollRef.current && topScrollRef.current) {
            isSyncingTabs.current = true;
            tabsScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
            requestAnimationFrame(() => {
                isSyncingTabs.current = false;
            });
        }
    };

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

    useEffect(() => {
        if (prevActiveIndexRef.current !== activeIndex) {
            prevActiveIndexRef.current = activeIndex;
            const currentMapped = mapKategoriToTab(soals[activeIndex]?.kategori);
            if (currentMapped && tabs.includes(currentMapped)) {
                setActiveTab(currentMapped);
            }
        }
    }, [activeIndex, soals, tabs]);

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

    useEffect(() => {
        if (activeTabRef.current && tabsScrollRef.current) {
            const tabEl = activeTabRef.current;
            const container = tabsScrollRef.current;
            const left = tabEl.offsetLeft - 16;
            container.scrollTo({ left, behavior: 'smooth' });
        }
    }, [activeTab]);

    const displayedQuestions = useMemo(() => {
        return soals
            .map((soal, originalIdx) => ({ soal, originalIdx }))
            .filter(({ soal }) => {
                if (tabs.length <= 1) return true;
                const mapped = mapKategoriToTab(soal.kategori);
                return mapped === activeTab;
            });
    }, [soals, activeTab, tabs]);

    // Ringkasan perolehan
    const totalBenar = useMemo(() => {
        return jawabanSiswa.filter((j) => j.is_benar).length;
    }, [jawabanSiswa]);

    const totalSalah = soals.length - totalBenar;

    return (
        <ContainerWhite className="w-full !p-0 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-white">
                <div>
                    <h3 className="font-extrabold text-[#1a2530] text-base tracking-tight">
                        Navigasi Pembahasan
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Klik nomor untuk membuka pembahasan
                    </p>
                </div>
                <span className="text-xl font-bold text-[#1b5e20] px-2.5 py-1 rounded-full shadow-xs">
                    {soals.length} Soal
                </span>
            </div>

            {/* Tab Bar dengan Background Kuning (#fcc526) */}
            {tabs.length > 1 && (
                <div className="bg-[#fcc526]">
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
                            const tabBenar = tabSoals.filter(
                                (s) => Boolean(jawabanMap[s.id_soal]?.is_benar)
                            ).length;

                            return (
                                <button
                                    key={tab}
                                    ref={isActive ? activeTabRef : null}
                                    type="button"
                                    onClick={() => handleTabClick(tab)}
                                    className={`px-4 py-2.5 rounded-t-xl text-xs flex items-center gap-1.5 whitespace-nowrap relative shrink-0 transition-colors duration-200 cursor-pointer ${
                                        isActive
                                            ? 'bg-white text-slate-900 font-black shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-10'
                                            : 'text-slate-900/85 hover:text-slate-950 hover:bg-black/5 font-extrabold'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavTabIndicatorPembahasan"
                                            className="absolute inset-0 bg-white rounded-t-xl shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-0 pointer-events-none"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}

                                    <span className="relative z-10 pointer-events-none font-bold">
                                        {tab}
                                    </span>
                                    <span
                                        className={`relative z-10 pointer-events-none text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                                            isActive
                                                ? 'bg-slate-100 text-slate-700'
                                                : 'bg-black/10 text-slate-900'
                                        }`}
                                    >
                                        {tabBenar}/{tabSoals.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Grid Nomor Soal */}
            <div className="p-5 sm:p-6 bg-white overflow-hidden">
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
                                const jwb = jawabanMap[soal.id_soal];
                                const isBenar = Boolean(jwb?.is_benar);

                                let btnClass =
                                    'h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 relative ';

                                if (isBenar) {
                                    // Jawaban benar: hijau primary
                                    btnClass +=
                                        'bg-[#1b5e20] hover:bg-[#144718] text-white border border-[#1b5e20] shadow-xs ';
                                } else {
                                    // Jawaban salah: rose/merah
                                    btnClass +=
                                        'bg-rose-500 hover:bg-rose-600 text-white border border-rose-500 shadow-xs ';
                                }

                                if (isCurrent) {
                                    btnClass +=
                                        'ring-2 ring-offset-2 ring-[#1b5e20] font-black scale-[1.03] z-10 shadow-md ';
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
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-md bg-[#1b5e20] shrink-0 shadow-xs" />
                        <span>Benar ({totalBenar})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shrink-0 shadow-xs" />
                        <span>Salah ({totalSalah})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-md border-2 border-[#1b5e20] bg-white ring-1 ring-[#1b5e20]/20 shrink-0" />
                        <span>Sedang Dibuka</span>
                    </div>
                </div>
            </div>
        </ContainerWhite>
    );
}
