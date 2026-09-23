import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Clock, ClipboardList, CheckCircle, Lock, Play, Pause, AlertTriangle, ArrowRight } from 'lucide-react';

import NavigasiSoal from '../Latihan/Partials/NavigasiSoal';
import SoalCard     from '../Latihan/Partials/SoalCard';

export default function Show({
    auth,
    paket,
    sesi,
    subtesList = [],
    activeSubtes = {},
    soals = [],
    savedJawaban = {},
    bisaPause = false,
    isPaused = false,
    errors,
}) {
    const storageKey = `tryout_jawaban_${paket.id_paket}_${sesi.id_sesi}`;
    const raguKey    = `tryout_ragu_${paket.id_paket}_${sesi.id_sesi}`;

    const [raguRagu, setRaguRagu] = useState(() => {
        try { return JSON.parse(localStorage.getItem(raguKey)) || {}; }
        catch { return {}; }
    });

    const initialJawaban = (() => {
        let local = {};
        try { local = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
        return { ...savedJawaban, ...local };
    })();

    const { data, setData, post, processing } = useForm({
        jawaban: initialJawaban,
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(activeSubtes.sisa_detik ?? 1800);
    const [showNextModal, setShowNextModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync to localStorage
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(data.jawaban)); }
        catch {}
    }, [data.jawaban]);

    useEffect(() => {
        try { localStorage.setItem(raguKey, JSON.stringify(raguRagu)); }
        catch {}
    }, [raguRagu]);

    // Timer logic per active subtest
    useEffect(() => {
        if (isPaused) return;

        setTimeLeft(activeSubtes.sisa_detik ?? 1800);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeExpired();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSubtes.kode, isPaused, activeSubtes.sisa_detik]);

    // Format seconds to mm:ss
    const formatTime = (seconds) => {
        if (seconds == null || seconds < 0) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const isUrgent = timeLeft != null && timeLeft <= 180;

    // Handle auto-advance when timer reaches 0
    const handleTimeExpired = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (activeSubtes.is_last) {
            doSubmit();
        } else {
            doPindahSubtes();
        }
    };

    const handleJawab = (soalId, value) => {
        const nextJawaban = { ...data.jawaban, [soalId]: value };
        setData('jawaban', nextJawaban);

        // Auto-save to server silently
        fetch(route('siswa.tryout.save-jawaban', paket.id_paket), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                id_soal: soalId,
                jawaban: value,
            }),
        }).catch(() => {});
    };

    const toggleRaguRagu = (soalId) =>
        setRaguRagu((prev) => ({ ...prev, [soalId]: !prev[soalId] }));

    const handleTogglePause = () => {
        router.post(route('siswa.tryout.toggle-pause', paket.id_paket), {}, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const doPindahSubtes = () => {
        setShowNextModal(false);
        setIsSubmitting(true);
        router.post(route('siswa.tryout.pindah-subtes', paket.id_paket), {
            jawaban: data.jawaban,
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setActiveIndex(0);
            }
        });
    };

    const doSubmit = () => {
        setShowSubmitModal(false);
        setIsSubmitting(true);
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(raguKey);
        } catch {}
        post(route('siswa.tryout.submit', paket.id_paket), {
            onFinish: () => setIsSubmitting(false)
        });
    };

    if (soals.length === 0) {
        return (
            <SiswaLayout user={auth.user} header="Kerjakan Try Out">
                <Head title={`Try Out ${paket.nama_paket}`} />
                <div className="mb-6">
                    <Link
                        href={route('siswa.tryout.index')}
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1b5e20] transition-colors"
                    >
                        <ArrowLeft size={16} /> Kembali ke Try Out
                    </Link>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center py-16">
                    <ClipboardList size={36} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-bold text-slate-700">Belum ada soal pada subtes ini</h3>
                    <p className="text-sm text-slate-400 mt-1">Silakan hubungi pengawas atau beralih ke subtes berikutnya.</p>
                    {!activeSubtes.is_last ? (
                        <button
                            onClick={doPindahSubtes}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1b5e20] text-white rounded-xl font-bold text-sm hover:bg-[#2d7e32] transition-colors"
                        >
                            Lanjut ke Subtes Berikutnya <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={doSubmit}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1b5e20] text-white rounded-xl font-bold text-sm hover:bg-[#2d7e32] transition-colors"
                        >
                            Selesaikan Try Out
                        </button>
                    )}
                </div>
            </SiswaLayout>
        );
    }

    const currentSoal = soals[activeIndex];

    return (
        <SiswaLayout user={auth.user} header={paket.nama_paket} examMode={true}>
            <Head title={`Try Out - ${paket.nama_paket}`} />

            {/* OVERLAY MODAL JIKA UJIAN SEDANG DI-PAUSE */}
            {isPaused && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                            <Pause size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-800">Ujian Sedang Dijeda</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Timer pengerjaan subtes <strong>{activeSubtes.nama}</strong> dihentikan sementara. Soal disembunyikan untuk menjaga integritas ujian.
                            </p>
                        </div>
                        <button
                            onClick={handleTogglePause}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#1b5e20] hover:bg-[#2d7e32] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md shadow-emerald-900/10 active:scale-98 transition-all"
                        >
                            <Play size={18} /> Lanjutkan Ujian
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6 pb-16">
                {/* SUBTEST PROGRESSION BAR */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subtes Ujian:</span>
                            <span className="text-sm font-extrabold text-[#1b5e20]">{activeSubtes.nama} ({activeSubtes.kode})</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            Soal {activeIndex + 1} dari {soals.length} pada subtes ini
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {subtesList.map((sub, idx) => {
                            const isAktif = sub.status === 'aktif';
                            const isSelesai = sub.status === 'selesai';

                            return (
                                <div
                                    key={sub.kode}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                                        isAktif
                                            ? 'bg-emerald-50 text-[#1b5e20] border-emerald-300 ring-2 ring-emerald-500/20'
                                            : isSelesai
                                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                                            : 'bg-slate-50 text-slate-400 border-slate-200/60'
                                    }`}
                                >
                                    {isSelesai ? (
                                        <CheckCircle size={13} className="text-emerald-600" />
                                    ) : isAktif ? (
                                        <span className="w-2 h-2 rounded-full bg-[#1b5e20] animate-ping" />
                                    ) : (
                                        <Lock size={12} className="text-slate-400" />
                                    )}
                                    <span>{sub.kode}</span>
                                    {isSelesai && <span className="text-[10px] text-slate-400 font-normal">Selesai</span>}
                                    {isAktif && <span className="text-[10px] text-emerald-700 font-normal">Aktif</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN EXAM GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* LEFT SIDEBAR: TIMER & NAVIGASI - Sticky tetap di layar saat di-scroll */}
                    <div className="lg:col-span-1 space-y-4 sticky top-28 self-start z-30">
                        {/* TIMER CARD KHUSUS SUBTES */}
                        <div className={`p-6 rounded-[2rem] border transition-all text-center relative overflow-hidden ${
                            isUrgent
                                ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                                : 'bg-white border-slate-100 text-slate-800 shadow-2xs'
                        }`}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={13} /> Sisa Waktu Subtes
                                </span>
                                {bisaPause && (
                                    <button
                                        type="button"
                                        onClick={handleTogglePause}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                        title="Jeda ujian sementara"
                                    >
                                        <Pause size={11} /> Jeda
                                    </button>
                                )}
                            </div>

                            <div className={`text-4xl font-black font-mono tracking-tight ${isUrgent ? 'text-red-600' : 'text-[#1b5e20]'}`}>
                                {formatTime(timeLeft)}
                            </div>

                            <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                Waktu habis otomatis mengunci subtes ini.
                            </p>
                        </div>

                        {/* NAVIGASI NOMOR SOAL */}
                        <div className="hidden lg:block">
                            <NavigasiSoal
                                soals={soals}
                                activeIndex={activeIndex}
                                jawaban={data.jawaban}
                                raguRagu={raguRagu}
                                processing={processing || isSubmitting}
                                onNavigate={setActiveIndex}
                                onKirim={() => {
                                    if (activeSubtes.is_last) {
                                        setShowSubmitModal(true);
                                    } else {
                                        setShowNextModal(true);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* SOAL CARD UTAMA */}
                    <div className="lg:col-span-3">
                        <SoalCard
                            soal={currentSoal}
                            soalIndex={activeIndex}
                            totalSoal={soals.length}
                            jawaban={data.jawaban}
                            raguRagu={raguRagu}
                            errors={errors}
                            processing={processing || isSubmitting}
                            onJawab={handleJawab}
                            onRagu={toggleRaguRagu}
                            onPrev={() => setActiveIndex((i) => Math.max(0, i - 1))}
                            onNext={() => setActiveIndex((i) => Math.min(soals.length - 1, i + 1))}
                            onKirim={() => {
                                if (activeSubtes.is_last) {
                                    setShowSubmitModal(true);
                                } else {
                                    setShowNextModal(true);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* MOBILE NAVIGASI */}
                <div className="block lg:hidden">
                    <NavigasiSoal
                        soals={soals}
                        activeIndex={activeIndex}
                        jawaban={data.jawaban}
                        raguRagu={raguRagu}
                        processing={processing || isSubmitting}
                        onNavigate={setActiveIndex}
                        onKirim={() => {
                            if (activeSubtes.is_last) {
                                setShowSubmitModal(true);
                            } else {
                                setShowNextModal(true);
                            }
                        }}
                    />
                </div>
            </div>

            {/* MODAL KONFIRMASI PINDAH SUBTES */}
            {showNextModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
                            <AlertTriangle size={28} />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-lg font-extrabold text-slate-800">Selesaikan Subtes {activeSubtes.kode}?</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Setelah beralih ke subtes berikutnya, subtes <strong>{activeSubtes.nama}</strong> akan <strong>terkunci secara permanen</strong> dan Anda tidak dapat kembali mengubah jawaban di subtes ini.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setShowNextModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                            >
                                Periksa Lagi
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={doPindahSubtes}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#1b5e20] text-white font-bold text-xs hover:bg-[#2d7e32] shadow-sm transition-all"
                            >
                                {isSubmitting ? 'Memproses...' : 'Ya, Lanjut Subtes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI FINAL SUBMIT */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center mx-auto border border-emerald-100">
                            <CheckCircle size={28} />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-lg font-extrabold text-slate-800">Kumpulkan Ujian Try Out?</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Anda telah mencapai subtes terakhir. Seluruh jawaban akan dikumpulkan dan dihitung bobot kesulitannya (IRT). Pastikan semua nomor telah terisi dengan baik.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                            >
                                Periksa Lagi
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={doSubmit}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#1b5e20] text-white font-bold text-xs hover:bg-[#2d7e32] shadow-sm transition-all"
                            >
                                {isSubmitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan Ujian'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SiswaLayout>
    );
}
