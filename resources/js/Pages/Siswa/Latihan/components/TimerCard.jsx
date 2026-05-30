import React from 'react';

/**
 * TimerCard
 * Menampilkan sisa waktu pengerjaan latihan dalam format Jam : Menit : Detik.
 *
 * Props:
 *  - timeLeft (number): sisa waktu dalam detik
 */
export default function TimerCard({ timeLeft }) {
    const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-200 text-slate-700 font-semibold text-center py-3 text-sm">
                Sisa Waktu
            </div>
            <div className="p-6">
                <div className="flex justify-center items-center gap-4 text-center">
                    <div>
                        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{h}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Jam</p>
                    </div>
                    <span className="text-2xl font-bold text-slate-300 animate-pulse pb-4">:</span>
                    <div>
                        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{m}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Menit</p>
                    </div>
                    <span className="text-2xl font-bold text-slate-300 animate-pulse pb-4">:</span>
                    <div>
                        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{s}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Detik</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
