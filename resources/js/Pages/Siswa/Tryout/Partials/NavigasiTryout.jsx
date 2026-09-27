import React from 'react';
import { CheckCircle, Lock, Send, ArrowRight } from 'lucide-react';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * NavigasiTryout
 * Khusus untuk alur Try Out:
 * 1. Tidak ada tab switch kategori/subtes (karena berjalan sekuensial otomatis).
 * 2. Menggabungkan info subtes aktif & stepper progress subtes langsung ke dalam card navigasi.
 * 3. Menampilkan nomor soal khusus subtes yang sedang aktif beserta legend dan tombol submit/lanjut.
 */
export default function NavigasiTryout({
    soals = [],
    activeIndex = 0,
    jawaban = {},
    raguRagu = {},
    subtesList = [],
    activeSubtes = {},
    processing = false,
    onNavigate,
    onKirim,
}) {
    return (
        <ContainerWhite className="w-full !p-0 overflow-hidden shadow-sm">
            {/* Header: Info Subtes yang Sedang Dikerjakan */}
            <div className="p-5 bg-white border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="font-extrabold text-[#1a2530] text-base tracking-tight">
                            Navigasi Soal
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Pilih nomor untuk melihat soal
                        </p>
                    </div>
                    <span className="text-xl font-bold text-[#1b5e20] px-2.5 py-1">
                        {soals.length} Soal
                    </span>
                </div>

                {/* Subtes Aktif & Stepper Progress Subtes */}
                {subtesList.length > 0 && (
                    <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Subtes Aktif:
                            </span>
                            {activeSubtes.nama && (
                                <span className="text-xs font-bold text-[#1b5e20]">
                                    {activeSubtes.nama}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {subtesList.map((sub) => {
                                const isAktif = sub.status === 'aktif';
                                const isSelesai = sub.status === 'selesai';

                                return (
                                    <div
                                        key={sub.kode}
                                        title={`${sub.nama} (${isSelesai ? 'Selesai' : isAktif ? 'Aktif' : 'Terkunci'})`}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all border ${
                                            isAktif
                                                ? 'bg-[#1b5e20] text-white border-[#1b5e20] shadow-xs'
                                                : isSelesai
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-50 text-slate-400 border-slate-200/70'
                                        }`}
                                    >
                                        {isSelesai ? (
                                            <CheckCircle size={10} className="text-emerald-600" />
                                        ) : isAktif ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        ) : (
                                            <Lock size={9} className="text-slate-400" />
                                        )}
                                        <span>{sub.kode}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Grid Nomor Soal Khusus Subtes Aktif */}
            <div className="p-5 sm:p-6 bg-white overflow-hidden space-y-5">
                <div className="grid grid-cols-5 gap-2.5">
                    {soals.map((soal, idx) => {
                        const isCurrent = idx === activeIndex;
                        const isAnswered =
                            jawaban[soal.id_soal] !== undefined &&
                            jawaban[soal.id_soal] !== null &&
                            jawaban[soal.id_soal] !== '';
                        const isRagu = Boolean(raguRagu[soal.id_soal]);

                        let btnClass =
                            'h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 relative ';

                        if (isRagu) {
                            btnClass +=
                                'bg-[#fcc526] hover:bg-[#eab522] text-white border border-[#fcc526] shadow-xs ';
                            if (isCurrent) {
                                btnClass +=
                                    'ring-2 ring-offset-2 ring-[#fcc526] font-black scale-[1.03] ';
                            }
                        } else if (isAnswered) {
                            btnClass +=
                                'bg-[#1b5e20] hover:bg-[#144718] text-white border border-[#1b5e20] shadow-xs ';
                            if (isCurrent) {
                                btnClass +=
                                    'ring-2 ring-offset-2 ring-[#1b5e20] font-black scale-[1.03] ';
                            }
                        } else {
                            btnClass +=
                                'bg-white hover:bg-emerald-50/50 text-slate-700 border border-emerald-600/30 hover:border-[#1b5e20] ';
                            if (isCurrent) {
                                btnClass +=
                                    'ring-2 ring-offset-2 ring-[#1b5e20] border-[#1b5e20] text-[#1b5e20] font-black scale-[1.03] ';
                            }
                        }

                        return (
                            <button
                                key={soal.id_soal || idx}
                                type="button"
                                disabled={processing}
                                onClick={() => onNavigate(idx)}
                                className={btnClass}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Keterangan / Legend Status */}
                <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-md bg-[#1b5e20] shrink-0" />
                        <span>Sudah Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-md bg-[#fcc526] shrink-0" />
                        <span>Ragu-Ragu</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-md border border-emerald-600/40 bg-white shrink-0" />
                        <span>Belum Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-md border-2 border-[#1b5e20] ring-1 ring-emerald-500/40 bg-white shrink-0" />
                        <span>Soal Aktif</span>
                    </div>
                </div>

                {/* Tombol Aksi: Lanjut Subtes atau Selesaikan Try Out */}
                <div className="pt-2">
                    <PrimaryButton
                        type="button"
                        disabled={processing}
                        onClick={onKirim}
                        className="w-full justify-center !py-3 !rounded-2xl !text-sm !font-bold flex items-center gap-2 shadow-sm"
                    >
                        {activeSubtes.is_last ? (
                            <>
                                <Send size={15} />
                                <span>Selesaikan Try Out</span>
                            </>
                        ) : (
                            <>
                                <span>Lanjut Subtes</span>
                                <ArrowRight size={15} />
                            </>
                        )}
                    </PrimaryButton>
                </div>
            </div>
        </ContainerWhite>
    );
}
