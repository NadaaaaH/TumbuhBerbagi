import React from 'react';
import { Send } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import PopupModal from '@/Components/PopupModal';

/**
 * ConfirmModal
 * Modal konfirmasi sebelum submit jawaban latihan menggunakan PopupModal yang reusable.
 */
export default function ConfirmModal({ isOpen, soals, jawaban, processing, onClose, onConfirm }) {
    const dijawab      = soals.filter(s => jawaban[s.id_soal] !== undefined && jawaban[s.id_soal] !== '').length;
    const belumDijawab = soals.length - dijawab;

    return (
        <PopupModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="md"
            showCloseButton={true}
            padding="p-8"
        >
            {/* Judul & deskripsi */}
            <h3 className="font-['Poppins'] text-xl font-bold text-slate-900 text-center mb-2 mt-2">
                Kirim Jawaban?
            </h3>
            <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
                Pastikan semua jawaban sudah kamu isi sebelum mengirimkan.
                Jawaban yang sudah dikirim{' '}
                <span className="font-semibold text-slate-700">tidak dapat diubah</span>.
            </p>

            {/* Ringkasan terjawab vs belum */}
            <div className="flex gap-4 justify-center mb-7 py-1">
                <div className="flex-1 text-center">
                    <p className="text-3xl font-extrabold text-[#1b5e20]">{dijawab}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Terjawab</p>
                </div>
                <div className="flex-1 text-center">
                    <p className="text-3xl font-extrabold text-red-500">{belumDijawab}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Belum Dijawab</p>
                </div>
            </div>

            {/* Aksi */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-xs active:scale-95"
                >
                    Batal
                </button>
                <PrimaryButton
                    type="button"
                    onClick={onConfirm}
                    disabled={processing}
                    className="flex-1 !py-3 !px-5 !rounded-full gap-2 shadow-md text-sm font-semibold"
                >
                    <Send size={15} />
                    {processing ? 'Mengirim...' : 'Ya, Kirim'}
                </PrimaryButton>
            </div>
        </PopupModal>
    );
}
