import React from 'react';
import ContainerWhite from '@/Components/ContainerWhite';
import { Clock } from 'lucide-react';

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
        <ContainerWhite className="w-full">
            <div className="flex items-center justify-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <Clock size={16} className="text-[#1b5e20]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Sisa Waktu</span>
            </div>
            <div className="flex justify-center items-center gap-3 md:gap-4 text-center">
                <div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{h}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Jam</p>
                </div>
                <span className="text-2xl font-bold text-slate-300 animate-pulse pb-4">:</span>
                <div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{m}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Menit</p>
                </div>
                <span className="text-2xl font-bold text-slate-300 animate-pulse pb-4">:</span>
                <div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{s}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Detik</p>
                </div>
            </div>
        </ContainerWhite>
    );
}
