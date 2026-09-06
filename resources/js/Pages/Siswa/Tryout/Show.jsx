import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Clock, ClipboardList } from 'lucide-react';

// Komponen-komponen latihan/tryout
import TimerCard    from '../Latihan/Partials/TimerCard';
import NavigasiSoal from '../Latihan/Partials/NavigasiSoal';
import SoalCard     from '../Latihan/Partials/SoalCard';
import ConfirmModal from '../Latihan/Partials/ConfirmModal';

export default function Show({ auth, paket, soals = [], sesi, errors }) {
    const storageKey = `tryout_jawaban_${paket.id_paket}_${sesi.id_sesi}`;
    const raguKey    = `tryout_ragu_${paket.id_paket}_${sesi.id_sesi}`;

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

    const [activeIndex,      setActiveIndex]      = useState(0);
    const [timeLeft,         setTimeLeft]         = useState(paket.waktu_ujian > 0 ? paket.waktu_ujian * 60 : null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(data.jawaban)); }
        catch {}
    }, [data.jawaban]);

    useEffect(() => {
        try { localStorage.setItem(raguKey, JSON.stringify(raguRagu)); }
        catch {}
    }, [raguRagu]);

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
                doSubmit();
            }
        };

        tick();
        timerInterval = setInterval(tick, 1000);
        return () => clearInterval(timerInterval);
    }, [sesi.waktu_mulai, paket.waktu_ujian]);

    const handleJawab = (soalId, value) =>
        setData('jawaban', { ...data.jawaban, [soalId]: value });

    const toggleRaguRagu = (soalId) =>
        setRaguRagu((prev) => ({ ...prev, [soalId]: !prev[soalId] }));

    const doSubmit = () => {
        setShowConfirmModal(false);
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(raguKey);
        } catch {}
        post(route('siswa.tryout.submit', paket.id_paket));
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
                    <h3 className="text-lg font-bold text-slate-700">Belum ada soal pada paket ini</h3>
                    <p className="text-sm text-slate-400 mt-1">Silakan coba paket Try Out yang lain.</p>
                </div>
            </SiswaLayout>
        );
    }

    const currentSoal = soals[activeIndex];

    return (
        <>
            <SiswaLayout user={auth.user} header={`Try Out: ${paket.nama_paket}`}>
                <Head title={`Try Out - ${paket.nama_paket}`} />

                {errors && Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                        {Object.values(errors).map((err, idx) => (
                            <p key={idx}>{err}</p>
                        ))}
                    </div>
                )}

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href={route('siswa.tryout.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1b5e20] transition-colors"
                    >
                        <ArrowLeft size={16} /> Kembali
                    </Link>
                </div>

                <div className="space-y-6 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <div className="lg:col-span-1 space-y-4">
                            <TimerCard paket={paket} timeLeft={timeLeft} />
                            <div className="hidden lg:block">
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

                        <SoalCard
                            soal={currentSoal}
                            currentIndex={activeIndex}
                            totalSoal={soals.length}
                            jawaban={data.jawaban[currentSoal?.id_soal]}
                            isRagu={!!raguRagu[currentSoal?.id_soal]}
                            processing={processing}
                            onJawab={handleJawab}
                            onRagu={toggleRaguRagu}
                            onPrev={() => setActiveIndex((i) => i - 1)}
                            onNext={() => setActiveIndex((i) => i + 1)}
                            onKirim={() => setShowConfirmModal(true)}
                        />
                    </div>

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
