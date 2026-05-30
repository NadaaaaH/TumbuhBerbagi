import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';

// Komponen-komponen latihan
import TimerCard    from './components/TimerCard';
import NavigasiSoal from './components/NavigasiSoal';
import SoalCard     from './components/SoalCard';
import ConfirmModal from './components/ConfirmModal';

export default function Show({ auth, paket, soals = [], sesi, errors }) {
    // ─── Kunci localStorage ───────────────────────────────────────────────
    const storageKey = `latihan_jawaban_${paket.id_paket}_${sesi.id_sesi}`;
    const raguKey    = `latihan_ragu_${paket.id_paket}_${sesi.id_sesi}`;

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

    const [activeIndex,      setActiveIndex]      = useState(0);
    const [timeLeft,         setTimeLeft]         = useState(paket.waktu_ujian > 0 ? paket.waktu_ujian * 60 : null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
            <SiswaLayout user={auth.user} header="Kerjakan Latihan">
                <Head title={`Latihan ${paket.nama_paket}`} />

                {/* Info paket */}
                <div className="mb-6">
                    <Link
                        href={route('siswa.latihan.index')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm mb-4"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Daftar Latihan
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{paket.nama_paket}</h1>
                    {paket.deskripsi && (
                        <p className="text-slate-500 text-sm mt-1">{paket.deskripsi}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                            <Clock size={14} className="text-slate-400" />
                            {paket.waktu_ujian > 0 ? `${paket.waktu_ujian} Menit` : 'Tidak Dibatasi'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                            <BookOpen size={14} className="text-slate-400" />
                            {soals.length} Soal
                        </span>
                    </div>
                </div>

                {/* Layout 2 kolom: kiri (timer + navigasi) | kanan (soal) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Kolom kiri */}
                    <div className="lg:col-span-4 space-y-6">
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

                    {/* Kolom kanan */}
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
                </div>
            </SiswaLayout>

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
