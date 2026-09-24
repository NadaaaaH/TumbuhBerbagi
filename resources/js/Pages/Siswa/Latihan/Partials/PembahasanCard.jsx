import React, { useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Info } from 'lucide-react';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomScrollbar from '@/Components/CustomScrollbar';

export default function PembahasanCard({
    soal,
    jawaban,
    soalIndex,
    totalSoal,
    onPrev,
    onNext,
}) {
    const isFirstSoal = soalIndex === 0;
    const isLastSoal = soalIndex === totalSoal - 1;
    const contentScrollRef = useRef(null);

    // Auto-scroll ke atas saat berpindah nomor soal
    useEffect(() => {
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [soalIndex]);

    const isBenar = Boolean(jawaban?.is_benar);

    // Cari objek opsi yang dipilih siswa
    const userAnswerChoice = useMemo(() => {
        if (!soal?.pilihan_jawaban || soal.pilihan_jawaban.length === 0) return null;
        return soal.pilihan_jawaban.find(
            (p) =>
                (jawaban?.id_pilihan != null && String(p.id_pilihan) === String(jawaban.id_pilihan)) ||
                (jawaban?.pilihan_jawaban?.id_pilihan != null &&
                    String(p.id_pilihan) === String(jawaban.pilihan_jawaban.id_pilihan)) ||
                (jawaban?.pilihan_jawaban?.kode_pilihan &&
                    p.kode_pilihan?.toUpperCase() ===
                    jawaban.pilihan_jawaban.kode_pilihan?.toUpperCase()) ||
                (jawaban?.teks_jawaban &&
                    String(jawaban.teks_jawaban).trim().toUpperCase() ===
                    String(p.kode_pilihan).trim().toUpperCase())
        );
    }, [soal?.pilihan_jawaban, jawaban]);

    // Cari objek opsi kunci jawaban yang benar
    const correctChoice = useMemo(() => {
        if (!soal?.pilihan_jawaban || soal.pilihan_jawaban.length === 0) return null;
        return soal.pilihan_jawaban.find(
            (p) =>
                soal.kunci_jawaban &&
                (String(p.kode_pilihan).trim().toUpperCase() ===
                    String(soal.kunci_jawaban).trim().toUpperCase() ||
                    String(p.id_pilihan) === String(soal.kunci_jawaban))
        );
    }, [soal?.pilihan_jawaban, soal?.kunci_jawaban]);

    if (!soal) {
        return (
            <ContainerWhite className="p-8 text-center text-slate-400">
                Pilih soal untuk melihat pembahasan.
            </ContainerWhite>
        );
    }

    const hasPilihan = Boolean(soal.pilihan_jawaban && soal.pilihan_jawaban.length > 0);

    return (
        <ContainerWhite className="w-full !p-0 shadow-sm overflow-hidden flex flex-col lg:h-[calc(100vh-8.5rem)]">
            {/* Header: Sama persis kayak SoalCard, dengan status benar/salah di sebelah kanan */}
            <div className="bg-white px-6 sm:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    {/* Teks soal ke-n: bersih tanpa background */}
                    <span className="font-extrabold text-[#1b5e20] text-base tracking-tight">
                        Soal ke-{soalIndex + 1}
                    </span>
                    {/* Teks subtes: background kuning (#fcc526) persis SoalCard */}
                    {soal.kategori && (
                        <span className="text-xs font-bold text-white uppercase tracking-wider bg-[#fcc526] border border-[#f5e6c4] px-2.5 py-1 rounded-lg">
                            {soal.kategori}
                        </span>
                    )}
                </div>

                <div>
                    {isBenar ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#508953] text-white border-2 border-[#508953] text-xs font-bold shadow-xs">
                            <CheckCircle2 size={15} /> Jawaban Anda Benar
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border-2 border-rose-200 text-xs font-bold shadow-xs">
                            <XCircle size={15} /> Jawaban Anda Salah
                        </span>
                    )}
                </div>
            </div>

            {/* Body Soal & Pembahasan: Di-scroll halus saat konten panjang */}
            <CustomScrollbar
                ref={contentScrollRef}
                theme="light"
                className="flex-1 p-6 md:p-8"
            >
                <div>
                    {/* Teks Pertanyaan: Sama persis kayak SoalCard */}
                    <div
                        className="text-slate-800 text-[15px] sm:text-base font-normal leading-relaxed mb-8 prose prose-slate max-w-none text-justify [&>p]:text-justify prose-img:rounded-2xl prose-img:max-h-[420px] prose-img:w-auto prose-img:mx-auto prose-img:shadow-md prose-img:my-4"
                        dangerouslySetInnerHTML={{ __html: soal.konten_soal }}
                    />

                    {/* Deretan Pilihan Jawaban: Bentuk & layout sama persis SoalCard, warna hijau #1b5e20 */}
                    {hasPilihan ? (
                        <div className="space-y-3.5 mb-8">
                            {soal.pilihan_jawaban.map((pilihan) => {
                                const isUserPick =
                                    userAnswerChoice?.id_pilihan === pilihan.id_pilihan ||
                                    (!userAnswerChoice &&
                                        ((jawaban?.id_pilihan != null &&
                                            String(pilihan.id_pilihan) === String(jawaban.id_pilihan)) ||
                                            (jawaban?.teks_jawaban &&
                                                String(jawaban.teks_jawaban).trim().toUpperCase() ===
                                                String(pilihan.kode_pilihan).trim().toUpperCase())));

                                const isKey =
                                    correctChoice?.id_pilihan === pilihan.id_pilihan ||
                                    (!correctChoice &&
                                        soal.kunci_jawaban &&
                                        (String(pilihan.kode_pilihan).trim().toUpperCase() ===
                                            String(soal.kunci_jawaban).trim().toUpperCase() ||
                                            String(pilihan.id_pilihan) === String(soal.kunci_jawaban)));

                                let itemStyle = 'border-slate-100 bg-white shadow-sm';
                                let badgeStyle = 'bg-slate-100 border-slate-200 text-slate-600';

                                if (isUserPick && isKey) {
                                    // 1. Siswa pilih dan BENAR
                                    itemStyle =
                                        'border-2 border-[#1b5e20] bg-[#1b5e20]/5 shadow-md ring-2 ring-[#1b5e20]/15';
                                    badgeStyle = 'bg-[#1b5e20] border-[#1b5e20] text-white shadow-xs';
                                } else if (isUserPick && !isKey) {
                                    // 2. Siswa pilih tapi SALAH
                                    itemStyle =
                                        'border-2 border-rose-400 bg-rose-50/70 text-rose-950 shadow-md ring-2 ring-rose-200/50';
                                    badgeStyle = 'bg-rose-500 border-rose-500 text-white font-bold shadow-xs';
                                } else if (isKey) {
                                    // 3. Kunci jawaban asli (tidak dipilih siswa)
                                    itemStyle =
                                        'border-2 border-[#1b5e20] bg-[#1b5e20]/5 shadow-sm';
                                    badgeStyle = 'bg-[#1b5e20] border-[#1b5e20] text-white font-bold shadow-xs';
                                }

                                return (
                                    <div
                                        key={pilihan.id_pilihan}
                                        className={`group w-full text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${itemStyle}`}
                                    >
                                        <span
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-all duration-200 ${badgeStyle}`}
                                        >
                                            {pilihan.kode_pilihan}
                                        </span>
                                        <span className="font-semibold text-slate-800 text-sm sm:text-[15px] pt-0.5 leading-relaxed text-justify flex-1">
                                            {pilihan.teks_pilihan}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Soal Esai / Isian */
                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-sm">
                                <div className="text-slate-400 font-semibold text-xs mb-1.5 uppercase tracking-wide">
                                    Jawaban Anda:
                                </div>
                                <div className="text-slate-800 font-bold text-base">
                                    {jawaban?.teks_jawaban || '(Tidak dijawab)'}
                                </div>
                            </div>
                            <div className="bg-[#1b5e20]/5 rounded-2xl p-5 border border-[#1b5e20]/25 text-sm">
                                <div className="text-[#1b5e20] font-semibold text-xs mb-1.5 uppercase tracking-wide">
                                    Kunci Jawaban:
                                </div>
                                <div className="text-[#1b5e20] font-bold text-base">
                                    {soal.kunci_jawaban}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Kotak Pembahasan: Tetap dipertahankan rapi */}
                    <div className="rounded-2xl bg-[#fafafa] border border-slate-200 p-6 text-sm text-slate-700 leading-relaxed shadow-sm">
                        <div className="font-extrabold text-slate-900 flex items-center gap-2 mb-3 text-base">
                            <span>Pembahasan</span>
                        </div>
                        {soal.pembahasan ? (
                            <div
                                className="text-slate-700 text-[15px] leading-relaxed prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                                dangerouslySetInnerHTML={{ __html: soal.pembahasan }}
                            />
                        ) : (
                            <p className="text-slate-500 italic">
                                Pembahasan belum disediakan untuk soal ini.
                            </p>
                        )}
                    </div>
                </div>
            </CustomScrollbar>

            {/* Footer Navigasi Soal: Tetap FIX di bagian bawah */}
            <div className="bg-white px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 z-10">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={isFirstSoal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                    <ChevronLeft size={16} />
                    Sebelumnya
                </button>

                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    Soal {soalIndex + 1} dari {totalSoal}
                </span>

                <PrimaryButton
                    type="button"
                    onClick={onNext}
                    disabled={isLastSoal}
                    className="gap-2 px-6 py-2.5 text-sm font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Berikutnya
                    <ChevronRight size={16} />
                </PrimaryButton>
            </div>
        </ContainerWhite>
    );
}
