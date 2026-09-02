import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Send } from 'lucide-react';

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
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            <X size={18} />
                        </button>

                        {/* Ikon peringatan */}
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                <AlertTriangle size={32} className="text-amber-500" />
                            </div>
                        </div>

                        {/* Judul & deskripsi */}
                        <h3 className="font-['Poppins'] text-xl font-bold text-slate-900 text-center mb-2">
                            Kirim Jawaban?
                        </h3>
                        <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
                            Pastikan semua jawaban sudah kamu isi sebelum mengirimkan.
                            Jawaban yang sudah dikirim{' '}
                            <span className="font-semibold text-slate-700">tidak dapat diubah</span>.
                        </p>

                        {/* Ringkasan terjawab vs belum */}
                        <div className="flex gap-3 mb-7">
                            <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-[#1b5e20]">{dijawab}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Terjawab</p>
                            </div>
                            <div className="flex-1 bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-red-500">{belumDijawab}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Belum Dijawab</p>
                            </div>
                        </div>

                        {/* Aksi */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={processing}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#1b5e20] hover:bg-[#144718] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                            >
                                <Send size={15} />
                                {processing ? 'Mengirim...' : 'Ya, Kirim'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
