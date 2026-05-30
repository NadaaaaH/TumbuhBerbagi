import React from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Send } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

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
    soal, soalIndex, totalSoal,
    jawaban, raguRagu, errors, processing,
    onJawab, onRagu, onPrev, onNext, onKirim,
}) {
    const isFirstSoal = soalIndex === 0;
    const isLastSoal  = soalIndex === totalSoal - 1;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header soal */}
            <div className="bg-slate-200 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 text-sm bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-sm">
                        Soal ke-{soalIndex + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {soal.kategori}
                    </span>
                </div>
            </div>

            {/* Body soal */}
            <div className="p-6 md:p-8 min-h-[350px] flex flex-col justify-between">
                <div>
                    {/* Teks pertanyaan */}
                    <div 
                        className="text-slate-800 text-base md:text-lg font-medium leading-relaxed mb-8 prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                        dangerouslySetInnerHTML={{ __html: soal.konten_soal }}
                    />

                    {/* Pilihan Jawaban */}
                    {soal.jenis_soal === 'pilihan_ganda' ? (
                        <div className="space-y-3.5">
                            {soal.pilihan_jawaban.map((pilihan) => {
                                const isSelected = String(jawaban[soal.id_soal]) === String(pilihan.id_pilihan);
                                return (
                                    <button
                                        key={pilihan.id_pilihan}
                                        type="button"
                                        onClick={() => onJawab(soal.id_soal, String(pilihan.id_pilihan))}
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
                                            {pilihan.kode_pilihan}
                                        </span>
                                        <span className="font-semibold text-slate-700 pt-0.5 leading-relaxed">
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
                                onChange={(e) => onJawab(soal.id_soal, e.target.value)}
                                placeholder="Tulis jawaban Anda di sini..."
                            />
                        </div>
                    )}

                    <InputError message={errors?.[`jawaban.${soal.id_soal}`]} className="mt-2" />
                </div>

                {/* Tombol navigasi bawah */}
                <div className="flex items-center justify-between gap-3 mt-12 pt-6 border-t border-slate-100">
                    {/* Sebelumnya */}
                    <button
                        type="button"
                        disabled={isFirstSoal}
                        onClick={onPrev}
                        className="inline-flex items-center gap-1.5 px-4 md:px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <ChevronLeft size={16} />
                        Sebelumnya
                    </button>

                    {/* Ragu-Ragu */}
                    <button
                        type="button"
                        onClick={() => onRagu(soal.id_soal)}
                        className={`inline-flex items-center gap-1.5 px-4 md:px-5 py-3 rounded-xl font-semibold text-xs md:text-sm transition-all border shadow-sm ${
                            raguRagu[soal.id_soal]
                                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                    >
                        <HelpCircle size={16} />
                        Ragu-Ragu
                    </button>

                    {/* Berikutnya / Kirim */}
                    {!isLastSoal ? (
                        <button
                            type="button"
                            onClick={onNext}
                            className="inline-flex items-center gap-1.5 px-4 md:px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs md:text-sm transition-colors shadow-sm"
                        >
                            Berikutnya
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onKirim}
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
    );
}
