import React from 'react';
import { Send } from 'lucide-react';

/**
 * NavigasiSoal
 * Menampilkan grid tombol navigasi antar soal, legenda warna, dan tombol "Kirim Jawaban".
 *
 * Props:
 *  - soals        (array)    : daftar soal
 *  - activeIndex  (number)   : index soal yang sedang aktif
 *  - jawaban      (object)   : { [id_soal]: nilai_jawaban }
 *  - raguRagu     (object)   : { [id_soal]: boolean }
 *  - processing   (boolean)  : sedang memproses submit
 *  - onNavigate   (fn)       : (idx) => void — pindah ke soal idx
 *  - onKirim      (fn)       : () => void — buka konfirmasi kirim
 */
export default function NavigasiSoal({ soals, activeIndex, jawaban, raguRagu, processing, onNavigate, onKirim }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-200 text-slate-700 font-semibold text-center py-3 text-sm">
                Navigasi Soal
            </div>
            <div className="p-6">
                {/* Grid Nomor Soal Berdasarkan Kategori */}
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {Array.from(new Set(soals.map(s => s.kategori))).map((kategori) => (
                        <div key={kategori}>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">
                                {kategori || 'Tanpa Kategori'}
                            </h4>
                            <div className="grid grid-cols-5 gap-2.5">
                                {soals.map((soal, idx) => {
                                    if (soal.kategori !== kategori) return null;
                                    
                                    const isCurrent  = idx === activeIndex;
                                    const isAnswered = jawaban[soal.id_soal] !== undefined && jawaban[soal.id_soal] !== '';
                                    const isRagu     = raguRagu[soal.id_soal];

                                    let btnClass = 'h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all ';
                                    if (isCurrent)       btnClass += 'bg-white border-2 border-[#1b5e20] text-[#1b5e20] shadow-sm';
                                    else if (isRagu)     btnClass += 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 shadow-sm';
                                    else if (isAnswered) btnClass += 'bg-[#1b5e20] hover:bg-[#144718] text-white border border-[#1b5e20] shadow-sm';
                                    else                 btnClass += 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200';

                                    return (
                                        <button
                                            key={soal.id_soal}
                                            type="button"
                                            onClick={() => onNavigate(idx)}
                                            className={btnClass}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legenda Warna */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-[#1b5e20] shrink-0" />
                        <span>Sudah Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-amber-500 shrink-0" />
                        <span>Ragu-Ragu</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 shrink-0" />
                        <span>Belum Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-white border-2 border-[#1b5e20] shrink-0" />
                        <span>Soal Aktif</span>
                    </div>
                </div>

                {/* Tombol Kirim Jawaban */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onKirim}
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
                    >
                        <Send size={16} />
                        Kirim Jawaban
                    </button>
                </div>
            </div>
        </div>
    );
}
