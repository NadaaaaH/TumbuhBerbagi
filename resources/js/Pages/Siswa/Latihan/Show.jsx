import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';

// Komponen-komponen latihan
import TimerCard    from './Partials/TimerCard';
import NavigasiSoal from './Partials/NavigasiSoal';
import SoalCard     from './Partials/SoalCard';
import ConfirmModal from './Partials/ConfirmModal';
import PetunjukModal from './Partials/PetunjukModal';

export default function Show({ auth, paket, soals = [], sesi, errors }) {
    // ─── Kunci localStorage ───────────────────────────────────────────────
    const storageKey  = `latihan_jawaban_${paket.id_paket}_${sesi.id_sesi}`;
    const raguKey     = `latihan_ragu_${paket.id_paket}_${sesi.id_sesi}`;
    const petunjukKey = `latihan_petunjuk_${paket.id_paket}_${sesi.id_sesi}`;

    // ─── State ────────────────────────────────────────────────────────────
    const [raguRagu, setRaguRagu] = useState(() => {
        try { return JSON.parse(localStorage.getItem(raguKey)) || {}; }
        catch { return {}; }
    });

    const { data, setData, post, processing } = useForm({
        jawaban: (() => {
            try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
            catch { return {}; }
        })(),
    });

    const [activeIndex,       setActiveIndex]       = useState(0);
    const [timeLeft,          setTimeLeft]          = useState(paket.waktu_ujian > 0 ? paket.waktu_ujian * 60 : null);
    const [showConfirmModal,  setShowConfirmModal]  = useState(false);
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

    // ─── Persist ke localStorage ──────────────────────────────────────────
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(data.jawaban)); }
        catch {}
    }, [data.jawaban]);

    useEffect(() => {
        try { localStorage.setItem(raguKey, JSON.stringify(raguRagu)); }
        catch {}
    }, [raguRagu]);

    // ─── Countdown timer (auto-submit saat waktu habis) ───────────────────
    useEffect(() => {
        if (!paket.waktu_ujian || paket.waktu_ujian <= 0) {
            setTimeLeft(null);
            return;
        }

        let dateStr = sesi.waktu_mulai || '';
        if (dateStr && !dateStr.includes('T')) {
            dateStr = dateStr.replace(' ', 'T');
        }
        if (dateStr && !dateStr.endsWith('Z')) {
            dateStr += 'Z';
        }
        const waktuMulai = new Date(dateStr);
        const limitTime = waktuMulai.getTime() + paket.waktu_ujian * 60 * 1000;
        let timerInterval;

        const tick = () => {
            const diff = Math.max(0, Math.floor((limitTime - Date.now()) / 1000));
            setTimeLeft(diff);
            if (diff <= 0) {
                clearInterval(timerInterval);
                doSubmit(); // auto-submit saat habis
            }
        };

        tick();
        timerInterval = setInterval(tick, 1000);
        return () => clearInterval(timerInterval);
    }, [sesi.waktu_mulai, paket.waktu_ujian]);

    // ─── Handler ─────────────────────────────────────────────────────────
    const handleJawab = (soalId, value) =>
        setData('jawaban', { ...data.jawaban, [soalId]: value });

    const toggleRaguRagu = (soalId) =>
        setRaguRagu((prev) => ({ ...prev, [soalId]: !prev[soalId] }));

    const doSubmit = () => {
        setShowConfirmModal(false);
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(raguKey);
            localStorage.removeItem(petunjukKey);
        } catch {}
        post(route('siswa.latihan.submit', paket.id_paket));
    };

    // ─── Guard: tidak ada soal ────────────────────────────────────────────
    if (soals.length === 0) {
        return (
            <SiswaLayout user={auth.user} header="Kerjakan Latihan">
                <Head title={`Latihan ${paket.nama_paket}`} />
                <div className="mb-6">
                    <Link
                        href={route('siswa.latihan.index')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Daftar Latihan
                    </Link>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                    Tidak ada soal aktif untuk paket ini.
                </div>
            </SiswaLayout>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <>
            <SiswaLayout user={auth.user} header={paket.nama_paket} examMode={true}>
                <Head title={`Latihan ${paket.nama_paket}`} />

                {/* Layout adaptif: pada mobile (Timer -> Soal -> Navigasi), pada desktop (Kiri: Timer + Navigasi, Kanan: Soal) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* MOBILE ONLY: Timer (Paling atas di mobile) */}
                    {paket.waktu_ujian > 0 && (
                        <div className="block lg:hidden">
                             <TimerCard timeLeft={timeLeft} />
                        </div>
                    )}

                    {/* DESKTOP ONLY: Kolom kiri (Timer + Navigasi) - Sticky tetap di layar saat di-scroll */}
                    <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-28 self-start z-30">
                        {paket.waktu_ujian > 0 && <TimerCard timeLeft={timeLeft} />}
                        <NavigasiSoal
                            soals={soals}
                            activeIndex={activeIndex}
                            jawaban={data.jawaban}
                            raguRagu={raguRagu}
                            processing={processing}
                            onNavigate={setActiveIndex}
                            onKirim={() => setShowConfirmModal(true)}
                        />
                    </div>

                    {/* ALWAYS: Kolom kanan / tengah (Soal) */}
                    <div className="lg:col-span-8">
                        <SoalCard
                            soal={soals[activeIndex]}
                            soalIndex={activeIndex}
                            totalSoal={soals.length}
                            jawaban={data.jawaban}
                            raguRagu={raguRagu}
                            errors={errors}
                            processing={processing}
                            onJawab={handleJawab}
                            onRagu={toggleRaguRagu}
                            onPrev={() => setActiveIndex((i) => i - 1)}
                            onNext={() => setActiveIndex((i) => i + 1)}
                            onKirim={() => setShowConfirmModal(true)}
                        />
                    </div>

                    {/* MOBILE ONLY: NavigasiSoal (Paling bawah di mobile) */}
                    <div className="block lg:hidden">
                        <NavigasiSoal
                            soals={soals}
                            activeIndex={activeIndex}
                            jawaban={data.jawaban}
                            raguRagu={raguRagu}
                            processing={processing}
                            onNavigate={setActiveIndex}
                            onKirim={() => setShowConfirmModal(true)}
                        />
                    </div>
                </div>
            </SiswaLayout>

            {/* Modal petunjuk pengerjaan (muncul pertama kali saat masuk latihan) */}
            <PetunjukModal
                isOpen={showPetunjukModal}
                onClose={handleClosePetunjuk}
            />

            {/* Modal konfirmasi submit */}
            <ConfirmModal
                isOpen={showConfirmModal}
                soals={soals}
                jawaban={data.jawaban}
                processing={processing}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={doSubmit}
            />
        </>
    );
}
