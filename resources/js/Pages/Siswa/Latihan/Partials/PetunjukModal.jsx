import React from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import PopupModal from '@/Components/PopupModal';

export default function PetunjukModal({ isOpen, onClose }) {
    const petunjukList = [
        {
            no: 1,
            title: 'Waktu Latihan',
            desc: 'Jika latihan memiliki batas waktu, jawaban akan terkirim secara otomatis ketika waktu habis.',
        },
        {
            no: 2,
            title: 'Bebas Berpindah Tab',
            desc: 'Kamu dapat membuka tab atau halaman lain selama mengerjakan latihan.',
        },
        {
            no: 3,
            title: 'Tandai Soal Ragu-Ragu',
            desc: 'Gunakan tombol Ragu-Ragu untuk menandai soal yang masih ingin kamu periksa kembali.',
        },
        {
            no: 4,
            title: 'Navigasi Soal',
            desc: 'Kamu dapat berpindah ke soal lain dan kembali ke soal sebelumnya selama waktu latihan masih tersedia.',
        },
    ];

    return (
        <PopupModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="xl"
            showCloseButton={false}
            padding="p-6 sm:p-8"
        >
            {/* Top Logo: Paper Write Bold dari Iconify (Statik tanpa motion) */}
            <div className="flex justify-center pt-2 mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-[#1b5e20] shadow-xs">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-9 h-9 sm:w-11 sm:h-11 text-[#1b5e20]"
                    >
                        <path d="M19 18.59a1 1 0 0 0-1 1v2.16a.25.25 0 0 1-.25.25H2.25a.25.25 0 0 1-.25-.23v-17a.25.25 0 0 1 .25-.25H3.5a1 1 0 0 0 0-2H2a2 2 0 0 0-2 2V22a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.41a1 1 0 0 0-1-1M16.5 4.5h1.25a.25.25 0 0 1 .25.25v.75a1 1 0 0 0 2 0v-1a2 2 0 0 0-2-2h-1.5a1 1 0 0 0 0 2" />
                        <path d="M7 5.5h6A1.5 1.5 0 0 0 14.5 4v-.5A1.5 1.5 0 0 0 13 2h-1a2 2 0 0 0-4 0H7a1.5 1.5 0 0 0-1.5 1.5V4A1.5 1.5 0 0 0 7 5.5M4 10a1 1 0 0 0 1 1h8a1 1 0 0 0 0-2H5a1 1 0 0 0-1 1m1 4a1 1 0 0 0 0 2h4.5a1 1 0 0 0 0-2Zm18.41-5.76a2 2 0 0 0-2.82 0l-7.87 7.87a.45.45 0 0 0-.11.17l-1.42 3.53a.51.51 0 0 0 .11.54a.49.49 0 0 0 .54.11l3.54-1.41a.6.6 0 0 0 .17-.11l7.86-7.87a2 2 0 0 0 0-2.83" />
                    </svg>
                </div>
            </div>

            {/* Header: Title & Description */}
            <div className="text-center mb-6">
                <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-black text-slate-850 tracking-tight mb-2">
                    Petunjuk Pengerjaan Latihan
                </h2>
                <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                    Beberapa hal yang perlu kamu ketahui sebelum mengerjakan latihan.
                </p>
            </div>

            {/* List Petunjuk: Nomor Bulat Kuning, teks hitam */}
            <div className="space-y-4 mb-6 text-left">
                {petunjukList.map((item) => (
                    <div key={item.no} className="flex items-start gap-3.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fcc526] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5 shadow-2xs">
                            {item.no}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-850 mb-0.5">
                                {item.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-black leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Callout Box */}
            <div className="p-4 rounded-2xl text-center mb-6">
                <p className="text-xs sm:text-sm font-semibold text-[#1b5e20] leading-relaxed">
                    Sudah siap? Mulai latihan dan kerjakan dengan sebaik mungkin.
                </p>
            </div>

            {/* Action Button: Mulai Latihan */}
            <div>
                <PrimaryButton
                    type="button"
                    onClick={onClose}
                    className="w-full !py-3.5 !text-sm sm:!text-base font-bold justify-center shadow-lg shadow-emerald-950/20"
                >
                    Mulai Latihan
                </PrimaryButton>
            </div>
        </PopupModal>
    );
}
