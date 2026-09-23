import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * ConfirmModal
 * Modal konfirmasi sebelum submit jawaban latihan.
 * Muncul di tengah layar dengan animasi scale + fade.
 *
 * Props:
 *  - isOpen     (boolean) : tampilkan modal atau tidak
 *  - soals      (array)   : daftar soal untuk hitung ringkasan
 *  - jawaban    (object)  : { [id_soal]: nilai_jawaban }
 *  - processing (boolean) : sedang memproses submit
 *  - onClose    (fn)      : () => void — tutup modal
 *  - onConfirm  (fn)      : () => void — konfirmasi & submit
 */
export default function ConfirmModal({ isOpen, soals, jawaban, processing, onClose, onConfirm }) {
    const dijawab     = soals.filter(s => jawaban[s.id_soal] !== undefined && jawaban[s.id_soal] !== '').length;
    const belumDijawab = soals.length - dijawab;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop blur */}
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

                    {/* Panel modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tombol tutup */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-100 text-slate-500 hover:text-slate-900 transition-all active:scale-95"
                            aria-label="Tutup"
                        >
                            <X size={18} />
                        </button>

                        {/* Judul & deskripsi */}
                        <h3 className="font-['Poppins'] text-xl font-bold text-slate-900 text-center mb-2 mt-2">
                            Kirim Jawaban?
                        </h3>
                        <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
                            Pastikan semua jawaban sudah kamu isi sebelum mengirimkan.
                            Jawaban yang sudah dikirim{' '}
                            <span className="font-semibold text-slate-700">tidak dapat diubah</span>.
                        </p>

                        {/* Ringkasan terjawab vs belum: Tanpa background dan border */}
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
