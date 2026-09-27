import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import axios from 'axios';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Clock, ClipboardList, CheckCircle, Lock, Play, Pause, AlertTriangle, ArrowRight, Send, HelpCircle } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import PopupModal from '@/Components/PopupModal';

import NavigasiTryout from './Partials/NavigasiTryout';
import SoalCard       from '../Latihan/Partials/SoalCard';
import PetunjukModal  from './Partials/PetunjukModal';
import IntermisiModal from './Partials/IntermisiModal';

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
    const isSubmittingRef = useRef(false);

    // Jeda 30 detik antar subtes (khusus paket yang tidak bisa dijeda)
    const [isIntermisi, setIsIntermisi] = useState(Boolean(activeSubtes.is_intermisi && activeSubtes.sisa_jeda > 0));
    const [jedaLeft, setJedaLeft] = useState(activeSubtes.sisa_jeda ?? 0);
    const [isStartingSubtes, setIsStartingSubtes] = useState(false);

    // Modal Petunjuk Pengerjaan Tryout (muncul otomatis saat pertama masuk sesi)
    const petunjukKey = `tryout_petunjuk_${paket.id_paket}_${sesi.id_sesi}`;
    const [showPetunjukModal, setShowPetunjukModal] = useState(() => {
        try {
            return !localStorage.getItem(petunjukKey);
        } catch {
            return true;
        }
    });

    const handleClosePetunjuk = () => {
        setShowPetunjukModal(false);
        try {
            localStorage.setItem(petunjukKey, 'true');
        } catch {}
    };

    // Local pause state untuk respon instan (optimistic UI)
    const [currentIsPaused, setCurrentIsPaused] = useState(Boolean(isPaused));
    const [isPausing, setIsPausing] = useState(false);
    const [isResuming, setIsResuming] = useState(false);

    useEffect(() => {
        setCurrentIsPaused(Boolean(isPaused));
    }, [isPaused]);

    // Sync to localStorage
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(data.jawaban)); }
        catch {}
    }, [data.jawaban]);

    useEffect(() => {
        try { localStorage.setItem(raguKey, JSON.stringify(raguRagu)); }
        catch {}
    }, [raguRagu]);

    // Update waktu saat subtes aktif berubah (hanya saat berganti subtes)
    useEffect(() => {
        setTimeLeft(activeSubtes.sisa_detik ?? 1800);
        isSubmittingRef.current = false;
        const hasIntermisi = Boolean(activeSubtes.is_intermisi && activeSubtes.sisa_jeda > 0);
        setIsIntermisi(hasIntermisi);
        setJedaLeft(activeSubtes.sisa_jeda ?? 0);
    }, [activeSubtes.kode, activeSubtes.is_intermisi, activeSubtes.sisa_jeda]);

    // Hitungan mundur jeda 30 detik antar subtes
    useEffect(() => {
        if (!isIntermisi || jedaLeft <= 0) return;

        const timer = setInterval(() => {
            setJedaLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsIntermisi(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isIntermisi, jedaLeft]);

    // Timer logic per subtest (hanya berjalan saat tidak dijeda dan tidak sedang jeda antar subtes)
    useEffect(() => {
        if (currentIsPaused || isIntermisi) return;

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
    }, [currentIsPaused, isIntermisi]);

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
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
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

        // Auto-save to server silently via axios
        axios.post(route('siswa.tryout.save-jawaban', paket.id_paket), {
            id_soal: soalId,
            jawaban: value,
        })
        .then((res) => {
            if (res.data && res.data.completed) {
                router.visit(route('siswa.tryout.hasil', paket.id_paket));
            }
        })
        .catch(() => {});
    };

    const toggleRaguRagu = (soalId) =>
        setRaguRagu((prev) => ({ ...prev, [soalId]: !prev[soalId] }));

    const handlePause = async () => {
        if (isPausing || isResuming) return;
        setIsPausing(true);
        // Langsung tampilkan modal jeda & bekukan timer
        setCurrentIsPaused(true);

        try {
            const res = await axios.post(route('siswa.tryout.toggle-pause', paket.id_paket), {
                client_time_left: timeLeft,
            });
            if (res.data && res.data.success) {
                setCurrentIsPaused(res.data.is_paused);
                if (res.data.sisa_detik != null) {
                    setTimeLeft(res.data.sisa_detik);
                }
            } else {
                setCurrentIsPaused(false);
            }
        } catch (err) {
            console.error('Gagal menjeda:', err);
            setCurrentIsPaused(false);
        } finally {
            setIsPausing(false);
        }
    };

    const handleResume = async () => {
        if (isPausing || isResuming) return;
        setIsResuming(true);

        try {
            const res = await axios.post(route('siswa.tryout.toggle-pause', paket.id_paket));
            if (res.data && res.data.success) {
                setCurrentIsPaused(res.data.is_paused);
                if (res.data.sisa_detik != null) {
                    setTimeLeft(res.data.sisa_detik);
                }
            } else {
                setCurrentIsPaused(true);
            }
        } catch (err) {
            console.error('Gagal melanjutkan:', err);
            setCurrentIsPaused(true);
        } finally {
            setIsResuming(false);
        }
    };

    const handleMulaiSubtesSekarang = async () => {
        if (isStartingSubtes) return;
        setIsStartingSubtes(true);
        try {
            await axios.post(route('siswa.tryout.mulai-subtes', paket.id_paket));
        } catch (err) {
            console.error('Gagal memulai subtes lebih awal:', err);
        } finally {
            setIsIntermisi(false);
            setJedaLeft(0);
            setIsStartingSubtes(false);
        }
    };

    const doPindahSubtes = () => {
        setShowNextModal(false);
        setIsSubmitting(true);
        isSubmittingRef.current = true;
        router.post(route('siswa.tryout.pindah-subtes', paket.id_paket), {
            jawaban: data.jawaban,
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                isSubmittingRef.current = false;
                setActiveIndex(0);
            }
        });
    };

    const doSubmit = () => {
        setShowSubmitModal(false);
        setIsSubmitting(true);
        isSubmittingRef.current = true;
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(raguKey);
            localStorage.removeItem(petunjukKey);
        } catch {}
        post(route('siswa.tryout.submit', paket.id_paket), {
            onFinish: () => {
                setIsSubmitting(false);
                isSubmittingRef.current = false;
            }
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
            {currentIsPaused && (
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
                            type="button"
                            disabled={isResuming}
                            onClick={handleResume}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#1b5e20] hover:bg-[#2d7e32] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md shadow-emerald-900/10 active:scale-98 transition-all"
                        >
                            {isResuming ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Melanjutkan...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={18} /> <span>Lanjutkan Ujian</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6 pb-16">
                {/* MAIN EXAM GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* LEFT SIDEBAR: TIMER & NAVIGASI - Sticky tetap di layar saat di-scroll */}
                    <div className="lg:col-span-1 space-y-4 sticky top-28 self-start z-30">
                        {/* TIMER CARD KHUSUS SUBTES */}
                        <div className={`p-6 rounded-[2rem] border transition-all text-center relative overflow-hidden ${
                            isUrgent
                                ? 'bg-red-50 border-red-300 text-red-800 animate-pulse'
                                : 'bg-white border-slate-100 text-slate-800 shadow-2xs'
                        }`}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className={`text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${
                                    isUrgent ? 'text-red-900 font-extrabold' : 'text-slate-400 font-bold'
                                }`}>
                                    <Clock size={13} className={isUrgent ? 'text-red-900' : 'text-slate-400'} /> Sisa Waktu Subtes
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowPetunjukModal(true)}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            isUrgent
                                                ? 'bg-red-100 text-red-900 hover:bg-red-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                        title="Petunjuk pengerjaan tryout"
                                    >
                                        <HelpCircle size={11} /> Petunjuk
                                    </button>
                                    {bisaPause && (
                                        <button
                                            type="button"
                                            disabled={isPausing}
                                            onClick={handlePause}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                                                isUrgent
                                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                            title="Jeda ujian sementara"
                                        >
                                            <Pause size={11} /> {isPausing ? 'Menjeda...' : 'Jeda'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={`text-4xl font-black font-mono tracking-tight ${isUrgent ? 'text-red-700' : 'text-[#1b5e20]'}`}>
                                {formatTime(timeLeft)}
                            </div>

                            <p className={`text-[11px] mt-2 font-medium ${
                                isUrgent ? 'text-red-900 font-semibold' : 'text-slate-400'
                            }`}>
                                Waktu habis otomatis mengunci subtes ini.
                            </p>
                        </div>

                        {/* NAVIGASI NOMOR SOAL & SUBTES */}
                        <div className="hidden lg:block">
                            <NavigasiTryout
                                soals={soals}
                                activeIndex={activeIndex}
                                jawaban={data.jawaban}
                                raguRagu={raguRagu}
                                subtesList={subtesList}
                                activeSubtes={activeSubtes}
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
                            nextLabel="Selanjutnya"
                            kirimLabel={activeSubtes.is_last ? "Kirim Jawaban" : "Lanjut Subtes"}
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
                    <NavigasiTryout
                        soals={soals}
                        activeIndex={activeIndex}
                        jawaban={data.jawaban}
                        raguRagu={raguRagu}
                        subtesList={subtesList}
                        activeSubtes={activeSubtes}
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
            <PopupModal
                isOpen={showNextModal}
                onClose={() => setShowNextModal(false)}
                maxWidth="md"
                showCloseButton={true}
                padding="p-8"
            >
                <div className="space-y-4 text-center">
                    {/* Logo Hijau Tanpa Container */}
                    <div className="flex justify-center pt-1">
                        <AlertTriangle size={56} className="text-[#1b5e20] stroke-[2]" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-['Poppins'] text-xl font-bold text-slate-900">
                            Selesaikan Subtes {activeSubtes.kode}?
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                            Setelah beralih ke subtes berikutnya, subtes <strong className="text-slate-700">{activeSubtes.nama}</strong> akan <strong className="text-slate-700">terkunci secara permanen</strong> dan Anda tidak dapat kembali mengubah jawaban di subtes ini.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setShowNextModal(false)}
                            className="flex-1 py-3 px-5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-xs active:scale-95"
                        >
                            Periksa Lagi
                        </button>
                        <PrimaryButton
                            type="button"
                            disabled={isSubmitting}
                            onClick={doPindahSubtes}
                            className="flex-1 !py-3 !px-5 !rounded-full gap-2 shadow-md text-sm font-semibold justify-center"
                        >
                            <span>{isSubmitting ? 'Memproses...' : 'Ya, Lanjut Subtes'}</span>
                            <ArrowRight size={15} />
                        </PrimaryButton>
                    </div>
                </div>
            </PopupModal>

            {/* MODAL KONFIRMASI FINAL SUBMIT */}
            <PopupModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                maxWidth="md"
                showCloseButton={true}
                padding="p-8"
            >
                <div className="space-y-4 text-center">
                    {/* Logo Hijau Tanpa Container */}
                    <div className="flex justify-center pt-1">
                        <CheckCircle size={56} className="text-[#1b5e20] stroke-[2]" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-['Poppins'] text-xl font-bold text-slate-900">
                            Kumpulkan Ujian Try Out?
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                            Anda telah mencapai subtes terakhir. Seluruh lembar jawaban akan dikumpulkan untuk dihitung nilainya. Pastikan semua nomor telah terisi dengan baik.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setShowSubmitModal(false)}
                            className="flex-1 py-3 px-5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-xs active:scale-95"
                        >
                            Periksa Lagi
                        </button>
                        <PrimaryButton
                            type="button"
                            disabled={isSubmitting}
                            onClick={doSubmit}
                            className="flex-1 !py-3 !px-5 !rounded-full gap-2 shadow-md text-sm font-semibold justify-center"
                        >
                            <Send size={15} />
                            <span>{isSubmitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan'}</span>
                        </PrimaryButton>
                    </div>
                </div>
            </PopupModal>
            {/* MODAL PETUNJUK PENGERJAAN TRYOUT */}
            <PetunjukModal
                isOpen={showPetunjukModal}
                onClose={handleClosePetunjuk}
            />

            {/* MODAL JEDA 30 DETIK SETIAP PERPINDAHAN SUBTES (KHUSUS TRYOUT TANPA JEDA) */}
            <IntermisiModal
                isOpen={isIntermisi && jedaLeft > 0}
                subtes={activeSubtes}
                jedaLeft={jedaLeft}
                onMulaiSekarang={handleMulaiSubtesSekarang}
                isStarting={isStartingSubtes}
            />
        </SiswaLayout>
    );
}
