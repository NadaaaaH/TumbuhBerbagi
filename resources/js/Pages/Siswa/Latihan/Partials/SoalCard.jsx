import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Send } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import TertiaryButton from '@/Components/TertiaryButton';
import CustomScrollbar from '@/Components/CustomScrollbar';

/**
 * SoalCard
 * Menampilkan satu soal beserta pilihan jawaban (pilihan ganda / esai),
 * serta tombol navigasi Sebelumnya, Ragu-Ragu, dan Berikutnya / Kirim.
 *
 * Props:
 *  - soal        (object)  : data soal aktif saat ini
 *  - soalIndex   (number)  : index soal aktif (0-based)
 *  - totalSoal   (number)  : total jumlah soal
 *  - jawaban     (object)  : { [id_soal]: nilai_jawaban }
 *  - raguRagu    (object)  : { [id_soal]: boolean }
 *  - errors      (object)  : error validasi dari Laravel
 *  - processing  (boolean) : sedang memproses submit
 *  - onJawab     (fn)      : (soalId, value) => void
 *  - onRagu      (fn)      : (soalId) => void
 *  - onPrev      (fn)      : () => void
 *  - onNext      (fn)      : () => void
 *  - onKirim     (fn)      : () => void — buka konfirmasi kirim
 */
export default function SoalCard({
    soal,
    soalIndex,
    totalSoal,
    jawaban,
    raguRagu,
    errors,
    processing,
    onJawab,
    onRagu,
    onPrev,
    onNext,
    onKirim,
}) {
    const isFirstSoal = soalIndex === 0;
    const isLastSoal = soalIndex === totalSoal - 1;
    const contentScrollRef = useRef(null);

    // Saat berpindah soal, scroll kembali ke posisi atas konten soal secara halus
    useEffect(() => {
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [soalIndex]);

    return (
        <ContainerWhite className="w-full !p-0 shadow-sm overflow-hidden flex flex-col lg:h-[calc(100vh-8.5rem)]">
            {/* Header soal: Tetap FIX di bagian atas kartu, tidak ikut tergeser saat konten di-scroll */}
            <div className="bg-white px-6 sm:px-8 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    {/* Teks soal ke-n: bersih tanpa background */}
                    <span className="font-extrabold text-[#1b5e20] text-base tracking-tight">
                        Soal ke-{soalIndex + 1}
                    </span>
                    {/* Teks subtes: background kuning pudar (#fef8e7) */}
                    {soal.kategori && (
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-[#fef8e7] border border-[#f5e6c4] px-2.5 py-1 rounded-lg">
                            {soal.kategori}
                        </span>
                    )}
                </div>
            </div>

            {/* Body soal: HANYA bagian ini yang di-scroll ke bawah saat konten soal panjang */}
            <CustomScrollbar
                ref={contentScrollRef}
                theme="light"
                className="flex-1 p-6 md:p-8"
            >
                <div>
                    {/* Teks pertanyaan: font lebih pas, align justify, foto aman dan rapi */}
                    <div
                        className="text-slate-800 text-[15px] sm:text-base font-normal leading-relaxed mb-8 prose prose-slate max-w-none text-justify [&>p]:text-justify prose-img:rounded-2xl prose-img:max-h-[420px] prose-img:w-auto prose-img:mx-auto prose-img:shadow-md prose-img:my-4"
                        dangerouslySetInnerHTML={{ __html: soal.konten_soal }}
                    />

                    {/* Pilihan Jawaban */}
                    {soal.jenis_soal === 'pilihan_ganda' ? (
                        <div className="space-y-3.5">
                            {soal.pilihan_jawaban.map((pilihan) => {
                                const isSelected =
                                    String(jawaban[soal.id_soal]) ===
                                    String(pilihan.id_pilihan);

                                return (
                                    <button
                                        key={pilihan.id_pilihan}
                                        type="button"
                                        onClick={() =>
                                            onJawab(
                                                soal.id_soal,
                                                String(pilihan.id_pilihan)
                                            )
                                        }
                                        className={`group w-full text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl border bg-white transition-all duration-300 relative overflow-hidden ${
                                            isSelected
                                                ? 'border-2 border-[#1b5e20] shadow-md ring-2 ring-[#1b5e20]/15'
                                                : 'border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        <span
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-[#1b5e20] border-[#1b5e20] text-white shadow-xs'
                                                    : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-[#1b5e20]/10 group-hover:text-[#1b5e20] group-hover:border-[#1b5e20]/30'
                                            }`}
                                        >
                                            {pilihan.kode_pilihan}
                                        </span>
                                        <span className="font-semibold text-slate-800 text-sm sm:text-[15px] pt-0.5 leading-relaxed text-justify flex-1">
                                            {pilihan.teks_pilihan}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        // Esai / isian singkat
                        <div className="space-y-2 max-w-xl">
                            <InputLabel
                                htmlFor={`jawaban-${soal.id_soal}`}
                                value="Jawaban Anda"
                                className="text-slate-600 font-semibold"
                            />
                            <TextInput
                                id={`jawaban-${soal.id_soal}`}
                                type="text"
                                className="mt-1 block w-full p-4 rounded-xl border-slate-200 focus:border-[#1b5e20] focus:ring-[#1b5e20]"
                                value={jawaban[soal.id_soal] || ''}
                                onChange={(e) =>
                                    onJawab(soal.id_soal, e.target.value)
                                }
                                placeholder="Tulis jawaban Anda di sini..."
                            />
                        </div>
                    )}

                    <InputError
                        message={errors?.[`jawaban.${soal.id_soal}`]}
                        className="mt-2"
                    />
                </div>
            </CustomScrollbar>

            {/* Tombol navigasi bawah: Tetap di bawah kartu secara rapi */}
            <div className="shrink-0 bg-white px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between gap-3 z-10">
                {/* Sebelumnya: Warna putih tetap */}
                <button
                    type="button"
                    disabled={isFirstSoal}
                    onClick={onPrev}
                    className="inline-flex items-center gap-1.5 px-4 md:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors font-semibold text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                >
                    <ChevronLeft size={16} />
                    Sebelumnya
                </button>

                {/* Ragu-Ragu: TertiaryButton */}
                <TertiaryButton
                    type="button"
                    onClick={() => onRagu(soal.id_soal)}
                    className={`inline-flex items-center gap-1.5 !px-4 md:!px-5 !py-2.5 sm:!py-3 !rounded-xl !text-xs md:!text-sm font-semibold transition-all border shadow-sm ${
                        raguRagu[soal.id_soal]
                            ? '!bg-[#fcc526] hover:!bg-[#eab522] !text-white !border-[#fcc526] shadow-md'
                            : ''
                    }`}
                >
                    <HelpCircle size={16} />
                    Ragu-Ragu
                </TertiaryButton>

                {/* Berikutnya / Kirim: PrimaryButton */}
                {!isLastSoal ? (
                    <PrimaryButton
                        type="button"
                        onClick={onNext}
                        className="inline-flex items-center gap-1.5 !px-5 md:!px-6 !py-2.5 sm:!py-3 !rounded-xl !text-xs md:!text-sm font-semibold shadow-md"
                    >
                        Berikutnya
                        <ChevronRight size={16} />
                    </PrimaryButton>
                ) : (
                    <PrimaryButton
                        type="button"
                        onClick={onKirim}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 !px-5 md:!px-6 !py-2.5 sm:!py-3 !rounded-xl !text-xs md:!text-sm font-semibold shadow-md"
                    >
                        <Send size={16} />
                        Kirim Jawaban
                    </PrimaryButton>
                )}
            </div>
        </ContainerWhite>
    );
}
