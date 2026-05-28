import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { ArrowLeft, Clock, BookOpen, ChevronLeft, ChevronRight, HelpCircle, Send } from 'lucide-react';

export default function Show({ auth, paket, soals = [], sesi, errors }) {
    const storageKey = `latihan_jawaban_${paket.id_paket}_${sesi.id_sesi}`;
    const raguKey = `latihan_ragu_${paket.id_paket}_${sesi.id_sesi}`;

    // Load initial answers and ragu-ragu states from localStorage
    const [initialJawaban] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const [raguRagu, setRaguRagu] = useState(() => {
        try {
            const saved = localStorage.getItem(raguKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const { data, setData, post, processing } = useForm({
        jawaban: initialJawaban,
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3600); // default to 60 minutes in seconds

    // Save jawaban to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(data.jawaban));
        } catch (e) {}
    }, [data.jawaban]);

    // Save raguRagu to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(raguKey, JSON.stringify(raguRagu));
        } catch (e) {}
    }, [raguRagu]);

    // Countdown Timer logic based on sesi.waktu_mulai
    useEffect(() => {
        // Parse UTC date string safely by converting 'YYYY-MM-DD HH:MM:SS' to ISO 8601 UTC format ('YYYY-MM-DDTHH:MM:SSZ')
        const formattedWaktuMulai = sesi.waktu_mulai ? sesi.waktu_mulai.replace(' ', 'T') + 'Z' : '';
        const waktuMulai = new Date(formattedWaktuMulai);
        const limitTime = waktuMulai.getTime() + 60 * 60 * 1000; // 60 minutes limit

        let timerInterval;

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((limitTime - now) / 1000));
            setTimeLeft(diff);

            if (diff <= 0) {
                if (timerInterval) {
                    clearInterval(timerInterval);
                }
                handleSubmit(true); // auto-submit
            }
        };

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);

        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [sesi.waktu_mulai]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: String(h).padStart(2, '0'),
            m: String(m).padStart(2, '0'),
            s: String(s).padStart(2, '0'),
        };
    };

    const handleChange = (soalId, value) => {
        setData('jawaban', {
            ...data.jawaban,
            [soalId]: value,
        });
    };

    const toggleRaguRagu = (soalId) => {
        setRaguRagu((prev) => ({
            ...prev,
            [soalId]: !prev[soalId],
        }));
    };

    const handleSubmit = (isAuto = false) => {
        if (!isAuto) {
            const confirmed = window.confirm("Apakah Anda yakin ingin menyelesaikan latihan ini dan mengirimkan seluruh jawaban?");
            if (!confirmed) return;
        }

        // Clean up local storage keys
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(raguKey);
        } catch (e) {}

        post(route('siswa.latihan.submit', paket.id_paket));
    };

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

    const currentSoal = soals[activeIndex];
    const timeFormatted = formatTime(timeLeft);

    return (
        <SiswaLayout user={auth.user} header="Kerjakan Latihan">
            <Head title={`Latihan ${paket.nama_paket}`} />

            {/* Sub-header info */}
            <div className="mb-6">
                <Link
                    href={route('siswa.latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm mb-4"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Latihan
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">{paket.nama_paket}</h1>
                {paket.deskripsi && <p className="text-slate-500 text-sm mt-1">{paket.deskripsi}</p>}
                
                <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                        <Clock size={14} className="text-slate-400" />
                        60 Menit
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                        <BookOpen size={14} className="text-slate-400" />
                        {soals.length} Soal
                    </span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (Timer & Navigasi) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Timer Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-200 text-slate-700 font-semibold text-center py-3 text-sm">
                            Sisa Waktu
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center gap-4 text-center">
                                <div>
                                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{timeFormatted.h}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Jam</p>
                                </div>
                                <span className="text-2xl font-bold text-slate-300 animate-pulse pb-4">:</span>
                                <div>
                                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{timeFormatted.m}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Menit</p>
                                </div>
                                <span className="text-2xl font-bold text-slate-300 animate-pulse pb-4">:</span>
                                <div>
                                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{timeFormatted.s}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Detik</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-200 text-slate-700 font-semibold text-center py-3 text-sm">
                            Navigasi Soal
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-5 gap-2.5">
                                {soals.map((soal, idx) => {
                                    const isCurrent = idx === activeIndex;
                                    const isAnswered = data.jawaban[soal.id_soal] !== undefined && data.jawaban[soal.id_soal] !== '';
                                    const isRagu = raguRagu[soal.id_soal];

                                    let btnClass = "h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all ";
                                    if (isCurrent) {
                                        btnClass += "bg-white border-2 border-[#1b5e20] text-[#1b5e20] shadow-sm";
                                    } else if (isRagu) {
                                        btnClass += "bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 shadow-sm";
                                    } else if (isAnswered) {
                                        btnClass += "bg-[#1b5e20] hover:bg-[#144718] text-white border border-[#1b5e20] shadow-sm";
                                    } else {
                                        btnClass += "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200";
                                    }

                                    return (
                                        <button
                                            key={soal.id_soal}
                                            type="button"
                                            onClick={() => setActiveIndex(idx)}
                                            className={btnClass}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend / Petunjuk Warna */}
                            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-[#1b5e20] shrink-0"></span>
                                    <span>Sudah Dijawab</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-amber-500 shrink-0"></span>
                                    <span>Ragu-Ragu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 shrink-0"></span>
                                    <span>Belum Dijawab</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-white border-2 border-[#1b5e20] shrink-0"></span>
                                    <span>Soal Aktif</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit(false)}
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
                                >
                                    <Send size={16} />
                                    Kirim Jawaban
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Soal & Opsi Jawaban) */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        
                        {/* Question Card Header */}
                        <div className="bg-slate-200 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                            <span className="font-semibold text-slate-700 text-sm">Soal ke-{activeIndex + 1}</span>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-300 shadow-sm">
                                {currentSoal.kategori}
                            </span>
                        </div>

                        {/* Question Card Body */}
                        <div className="p-6 md:p-8 min-h-[350px] flex flex-col justify-between">
                            <div>
                                {/* Question Text */}
                                <div className="text-slate-800 text-base md:text-lg font-medium leading-relaxed mb-8 whitespace-pre-line">
                                    {currentSoal.konten_soal}
                                </div>

                                {/* Answers Options / Inputs */}
                                {currentSoal.jenis_soal === 'pilihan_ganda' ? (
                                    <div className="space-y-3.5">
                                        {currentSoal.pilihan_jawaban.map((pilihan) => {
                                            const letter = pilihan.kode_pilihan || '';
                                            const text = pilihan.teks_pilihan || '';
                                            const isSelected = String(data.jawaban[currentSoal.id_soal]) === String(pilihan.id_pilihan);

                                            return (
                                                <button
                                                    key={pilihan.id_pilihan}
                                                    type="button"
                                                    onClick={() => handleChange(currentSoal.id_soal, String(pilihan.id_pilihan))}
                                                    className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                                        isSelected
                                                            ? 'border-[#1b5e20] bg-green-50/50 shadow-sm ring-1 ring-[#1b5e20]'
                                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                                                    }`}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border transition-all ${
                                                        isSelected
                                                            ? 'bg-[#1b5e20] border-[#1b5e20] text-white shadow-sm'
                                                            : 'bg-slate-100 border-slate-200 text-slate-500'
                                                    }`}>
                                                        {letter}
                                                    </span>
                                                    <span className="font-semibold text-slate-700 pt-0.5 leading-relaxed">
                                                        {text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-w-xl">
                                        <InputLabel htmlFor={`jawaban-${currentSoal.id_soal}`} value="Jawaban Anda" className="text-slate-600 font-semibold" />
                                        <TextInput
                                            id={`jawaban-${currentSoal.id_soal}`}
                                            type="text"
                                            className="mt-1 block w-full p-4 rounded-xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20]"
                                            value={data.jawaban[currentSoal.id_soal] || ''}
                                            onChange={(e) => handleChange(currentSoal.id_soal, e.target.value)}
                                            placeholder="Tulis jawaban Anda di sini..."
                                        />
                                    </div>
                                )}
                                <InputError message={errors?.[`jawaban.${currentSoal.id_soal}`]} className="mt-2" />
                            </div>

                            {/* Navigation buttons at the bottom */}
                            <div className="flex items-center justify-between gap-3 mt-12 pt-6 border-t border-slate-100">
                                
                                <button
                                    type="button"
                                    disabled={activeIndex === 0}
                                    onClick={() => setActiveIndex(activeIndex - 1)}
                                    className="inline-flex items-center gap-1.5 px-4 md:px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                    Sebelumnya
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toggleRaguRagu(currentSoal.id_soal)}
                                    className={`inline-flex items-center gap-1.5 px-4 md:px-5 py-3 rounded-xl font-semibold text-xs md:text-sm transition-all border shadow-sm ${
                                        raguRagu[currentSoal.id_soal]
                                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    <HelpCircle size={16} />
                                    Ragu-Ragu
                                </button>

                                {activeIndex < soals.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setActiveIndex(activeIndex + 1)}
                                        className="inline-flex items-center gap-1.5 px-4 md:px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs md:text-sm transition-colors shadow-sm"
                                    >
                                        Berikutnya
                                        <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(false)}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-5 md:px-6 py-3 rounded-xl bg-[#1b5e20] hover:bg-[#144718] text-white font-semibold text-xs md:text-sm transition-colors shadow-sm"
                                    >
                                        <Send size={16} />
                                        Kirim Jawaban
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </SiswaLayout>
    );
}
