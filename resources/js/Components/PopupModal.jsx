import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * PopupModal
 * Komponen popup / modal universal dengan ukuran fleksibel, animasi halus, dan backdrop blur.
 *
 * Props:
 * - isOpen (boolean)             : Status apakah modal ditampilkan (default: false)
 * - onClose (function)           : Handler ketika modal ditutup
 * - maxWidth (string)            : 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' atau class custom (default: 'md')
 * - showCloseButton (boolean)    : Menampilkan tombol X di sudut kanan atas (default: true)
 * - closeOnOverlayClick (boolean): Menutup saat klik di luar area modal (default: true)
 * - padding (string)             : Utility class padding Tailwind (default: 'p-6 sm:p-8')
 * - className (string)           : Utility class tambahan untuk panel modal
 * - children (node)              : Konten di dalam modal
 */
export default function PopupModal({
    isOpen = false,
    onClose = () => {},
    maxWidth = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    padding = 'p-6 sm:p-8',
    className = '',
    children,
}) {
    // Cegah scroll pada body & tambahkan shortcut keyboard Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    // Pemetaan ukuran fleksibel
    const maxWidthClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        full: 'max-w-full mx-4',
    };

    const resolvedMaxWidth = maxWidthClasses[maxWidth] || maxWidth;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="popup-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                    onClick={closeOnOverlayClick ? onClose : undefined}
                >
                    {/* Backdrop Blur Gelap */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

                    {/* Panel Modal */}
                    <motion.div
                        key="popup-modal-panel"
                        initial={{ opacity: 0, scale: 0.94, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative w-full ${resolvedMaxWidth} bg-white rounded-3xl shadow-2xl border border-slate-100/80 font-['Inter',sans-serif] overflow-y-auto no-scrollbar max-h-[90vh] ${padding} ${className}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tombol Tutup (X) */}
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-slate-100 text-slate-400 hover:text-slate-700 shadow-sm border border-slate-100 transition-all active:scale-95"
                                aria-label="Tutup"
                            >
                                <X size={18} />
                            </button>
                        )}

                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
