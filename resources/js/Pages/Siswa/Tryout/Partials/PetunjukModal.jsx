import React from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import PopupModal from '@/Components/PopupModal';

export default function PetunjukModal({ isOpen, onClose }) {
    const petunjukList = [
        {
            no: 1,
            title: 'Waktu Tes',
            desc: 'Setiap subtes memiliki batas waktu. Jika waktu pada suatu subtes habis, sistem akan langsung berpindah ke subtes atau soal berikutnya sesuai ketentuan tryout.',
        },
        {
            no: 2,
            title: 'Tombol Jeda',
            desc: 'Pada tryout tertentu, tersedia tombol Jeda untuk menghentikan waktu sementara. Fitur ini hanya tersedia pada tryout yang mendukungnya.',
        },
        {
            no: 3,
            title: 'Tandai Soal Ragu-Ragu',
            desc: 'Gunakan tombol Ragu-Ragu untuk menandai soal yang masih ingin kamu periksa kembali.',
        },
        {
            no: 4,
            title: 'Urutan Subtes',
            desc: 'Pada paket tryout tertentu, subtes dapat ditampilkan dalam urutan yang berbeda atau secara acak. Perhatikan subtes yang sedang dikerjakan sebelum melanjutkan.',
        },
        {
            no: 5,
            title: 'Perhatikan Waktu',
            desc: 'Gunakan waktu yang tersedia dengan baik. Ketika waktu subtes berakhir, sistem akan melanjutkan secara otomatis sesuai pengaturan tryout.',
        },
    ];

    return (
        <PopupModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="xl"
            align="top"
            showCloseButton={false}
            padding="p-6 sm:p-7"
        >
            {/* Top Logo: Paper Write Bold dari Iconify */}
            <div className="flex justify-center pt-1 mb-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-[#1b5e20]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8 sm:w-9 sm:h-9 text-[#1b5e20]"
                    >
                        <path d="M19 18.59a1 1 0 0 0-1 1v2.16a.25.25 0 0 1-.25.25H2.25a.25.25 0 0 1-.25-.23v-17a.25.25 0 0 1 .25-.25H3.5a1 1 0 0 0 0-2H2a2 2 0 0 0-2 2V22a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.41a1 1 0 0 0-1-1M16.5 4.5h1.25a.25.25 0 0 1 .25.25v.75a1 1 0 0 0 2 0v-1a2 2 0 0 0-2-2h-1.5a1 1 0 0 0 0 2" />
                        <path d="M7 5.5h6A1.5 1.5 0 0 0 14.5 4v-.5A1.5 1.5 0 0 0 13 2h-1a2 2 0 0 0-4 0H7a1.5 1.5 0 0 0-1.5 1.5V4A1.5 1.5 0 0 0 7 5.5M4 10a1 1 0 0 0 1 1h8a1 1 0 0 0 0-2H5a1 1 0 0 0-1 1m1 4a1 1 0 0 0 0 2h4.5a1 1 0 0 0 0-2Zm18.41-5.76a2 2 0 0 0-2.82 0l-7.87 7.87a.45.45 0 0 0-.11.17l-1.42 3.53a.51.51 0 0 0 .11.54a.49.49 0 0 0 .54.11l3.54-1.41a.6.6 0 0 0 .17-.11l7.86-7.87a2 2 0 0 0 0-2.83" />
                    </svg>
                </div>
            </div>

            {/* Header: Title & Description */}
            <div className="text-center mb-4">
                <h2 className="font-['Poppins'] text-xl sm:text-2xl font-black text-slate-850 tracking-tight mb-1.5">
                    Sebelum Memulai Tryout
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Tryout ini dirancang menyerupai pelaksanaan UTBK. Pastikan kamu memahami aturan berikut sebelum memulai.
                </p>
            </div>

            {/* List Petunjuk: Nomor Bulat Kuning (#fcc526), teks hitam */}
            <div className="space-y-3 mb-4 text-left">
                {petunjukList.map((item) => (
                    <div key={item.no} className="flex items-start gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fcc526] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                            {item.no}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-850 mb-0.5">
                                {item.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Callout Text tanpa background */}
            <div className="text-center mb-4 px-2">
                <p className="text-xs sm:text-sm font-semibold text-[#1b5e20] leading-relaxed">
                    Pastikan kamu sudah siap sebelum memulai. Kerjakan tryout dengan fokus dan tenang.
                </p>
            </div>

            {/* Action Button: Mulai Tryout */}
            <div>
                <PrimaryButton
                    type="button"
                    onClick={onClose}
                    className="w-full !py-3 !text-sm sm:!text-base font-bold justify-center shadow-lg shadow-emerald-950/20"
                >
                    Mulai Tryout
                </PrimaryButton>
            </div>
        </PopupModal>
    );
}
