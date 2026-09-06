import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, X } from 'lucide-react';

export default function KegiatanModal({ kegiatan, auth, onClose }) {
    const formattedDate = kegiatan.tanggal
        ? new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
        : '-';

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

            <motion.div
                key="modal-panel"
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-t-2xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-slate-100 font-['Inter',sans-serif]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-100 text-slate-500 hover:text-slate-900 transition-all active:scale-95"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>

                {/* Banner Image */}
                <div className="w-full h-56 sm:h-72 bg-slate-100 overflow-hidden relative flex-shrink-0">
                    {kegiatan.gambar_url ? (
                        <img
                            src={kegiatan.gambar_url}
                            alt={kegiatan.nama_kegiatan}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Calendar size={64} opacity={0.3} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-8">
                    <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight mb-3">
                        {kegiatan.nama_kegiatan}
                    </h2>

                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500">
                            <Calendar size={12} className="text-[#1b5e20]" />
                            {formattedDate}
                        </span>
                        {(kegiatan.waktu_mulai || kegiatan.waktu_selesai) && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500">
                                <Clock size={12} className="text-[#1b5e20]" />
                                {kegiatan.waktu_mulai ? kegiatan.waktu_mulai.substring(0, 5) : '00:00'} – {kegiatan.waktu_selesai ? kegiatan.waktu_selesai.substring(0, 5) : 'Selesai'} WIB
                            </span>
                        )}
                    </div>

                    <div className="w-12 h-1 rounded-full bg-[#1b5e20] mb-6" />

                    <div className="text-slate-600 font-light leading-relaxed text-base whitespace-pre-wrap mb-2">
                        {kegiatan.deskripsi || 'Tidak ada deskripsi untuk kegiatan ini.'}
                    </div>

                    {/* Instagram Link Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
                        <a
                            href="https://www.instagram.com/tumbuhberbagi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-[#1b5e20] hover:shadow-[0_4px_16px_rgba(27,94,32,0.2)] flex items-center justify-center transition-all active:scale-95 shadow-sm"
                            aria-label="Instagram @tumbuhberbagi"
                            title="Instagram @tumbuhberbagi"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
