import React from 'react';
import PopupModal from '@/Components/PopupModal';
import PrimaryButton from '@/Components/PrimaryButton';
import { Coffee, ArrowRight } from 'lucide-react';

export default function IntermisiModal({
    isOpen = false,
    subtes = {},
    jedaLeft = 30,
    onMulaiSekarang,
    isStarting = false,
}) {
    const formattedSeconds = String(Math.max(0, jedaLeft)).padStart(2, '0');

    return (
        <PopupModal
            isOpen={isOpen}
            onClose={() => {}} // Tidak bisa ditutup sembarangan, harus tunggu countdown atau klik Mulai Sekarang
            maxWidth="md"
            showCloseButton={false}
            align="top"
            padding="p-8"
        >
            <div className="space-y-4 text-center">
                {/* Logo Hijau Tanpa Container */}
                <div className="flex justify-center pt-1">
                    <Coffee size={56} className="text-[#1b5e20] stroke-[1.75]" />
                </div>

                <div className="space-y-2">
                    <h4 className="font-['Poppins'] text-xl sm:text-2xl font-bold text-slate-900">
                        Jeda Antar Subtes
                    </h4>

                    {subtes?.nama && (
                        <p className="text-sm font-medium text-slate-500">
                            Subtes Berikutnya: <span className="font-bold text-[#1b5e20]">{subtes.nama}</span>
                        </p>
                    )}

                    <div className="py-3">
                        <div className="text-5xl font-black font-mono tracking-tight text-[#1b5e20]">
                            00:{formattedSeconds}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                            Waktu istirahat sebelum subtes dimulai
                        </p>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Tarik napas dan rileks sejenak. Waktu pengerjaan subtes berikutnya belum berjalan dan akan dimulai otomatis setelah hitungan mundur selesai.
                    </p>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        type="button"
                        disabled={isStarting}
                        onClick={onMulaiSekarang}
                        className="w-full !py-3.5 !px-6 !rounded-full gap-2 shadow-md text-sm font-semibold justify-center"
                    >
                        <span>{isStarting ? 'Memulai Subtes...' : 'Mulai Sekarang'}</span>
                        <ArrowRight size={15} />
                    </PrimaryButton>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Atau tunggu hingga hitungan mundur berakhir
                    </p>
                </div>
            </div>
        </PopupModal>
    );
}
