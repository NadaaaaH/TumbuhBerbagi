import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Download, FileSpreadsheet, CheckCircle2, XCircle, Clock, Award, Users, Search, Eye, X, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================
//  PDF PREVIEW MODAL
// ============================================================
function PdfPreviewModal({ isOpen, onClose, previewUrl, downloadUrl, title }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Fallback timeout to hide spinner if iframe onLoad does not fire (common in PDF iframe previews)
            const timer = setTimeout(() => {
                setLoading(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, previewUrl]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{ width: '90vw', maxWidth: '960px', height: '90vh' }}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1b5e20]/10 flex items-center justify-center flex-shrink-0">
                            <FileText size={18} className="text-[#1b5e20]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">Pratinjau Dokumen</h2>
                            <p className="text-xs text-slate-500 leading-tight mt-0.5 line-clamp-1">{title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={downloadUrl}
                            className="inline-flex items-center gap-2 bg-[#1b5e20] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#144718] transition-colors shadow-sm"
                        >
                            <Download size={14} />
                            Unduh PDF
                        </a>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Tutup"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 pointer-events-none"
                        style={{ top: '65px' }}>
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={28} className="text-[#1b5e20] animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">Memuat pratinjau...</p>
                        </div>
                    </div>
                )}

                {/* PDF Iframe */}
                <div className="flex-1 bg-slate-100 relative overflow-hidden">
                    <iframe
                        src={previewUrl}
                        title={`Pratinjau: ${title}`}
                        className="w-full h-full border-0"
                        onLoad={() => setLoading(false)}
                        style={{ display: 'block' }}
                    />
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                    <p className="text-xs text-slate-400 text-center">
                        Pratinjau dokumen ini dibuat secara otomatis oleh sistem Tumbuh Berbagi.
                        Klik <strong className="text-slate-600">Unduh PDF</strong> untuk menyimpan dokumen.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function Show({ auth, paket, pesertaSudah, pesertaBelum, questionStats }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortSudah, setSortSudah] = useState('waktu_asc');
    const [previewModal, setPreviewModal] = useState({
        open: false,
        previewUrl: '',
        downloadUrl: '',
        title: '',
    });

    const openPreview = (previewUrl, downloadUrl, title) => {
        setPreviewModal({ open: true, previewUrl, downloadUrl, title });
    };

    const closePreview = () => {
        setPreviewModal(prev => ({ ...prev, open: false }));
    };

    const sortedSudah = useMemo(() => {
        return [...pesertaSudah].sort((a, b) => {
            if (sortSudah === 'nilai_desc') {
                return (b.hasil_latihan?.nilai_akhir ?? 0) - (a.hasil_latihan?.nilai_akhir ?? 0);
            }
            // waktu_asc: duluan ngerjain (earliest waktu_selesai)
            return new Date(a.waktu_selesai ?? 0) - new Date(b.waktu_selesai ?? 0);
        });
    }, [pesertaSudah, sortSudah]);

    const filteredStats = questionStats.filter(stat =>
        stat.konten_soal?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout user={auth.user} header={`Detail Sesi Latihan: ${paket.nama_paket}`}>
            <Head title={`Sesi ${paket.nama_paket}`} />

            {/* PDF Preview Modal */}
            <PdfPreviewModal
                isOpen={previewModal.open}
                onClose={closePreview}
                previewUrl={previewModal.previewUrl}
                downloadUrl={previewModal.downloadUrl}
                title={previewModal.title}
            />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Link
                    href={route('sesi-latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Sesi Latihan
                </Link>

                {pesertaSudah.length > 0 && (
                    <button
                        onClick={() => openPreview(
                            route('sesi-latihan.preview-all', paket.id_paket),
                            route('sesi-latihan.export-all', paket.id_paket),
                            `Laporan Semua Peserta — ${paket.nama_paket}`
                        )}
                        className="inline-flex items-center justify-center gap-2 bg-[#1b5e20] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#144718] transition-colors shadow-sm"
                    >
                        <Eye size={16} />
                        Pratinjau &amp; Ekspor Semua Peserta
                    </button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Left Column: Participants */}
                <div className="space-y-6">
                    {/* Already Attempted List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Award className="text-green-600" size={20} />
                                Sudah Mengerjakan ({pesertaSudah.length})
                            </h2>
                            {pesertaSudah.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Urutkan:</span>
                                    <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-semibold">
                                        <button
                                            onClick={() => setSortSudah('nilai_desc')}
                                            className={`px-3 py-1.5 transition-colors ${sortSudah === 'nilai_desc'
                                                    ? 'bg-[#1b5e20] text-white'
                                                    : 'bg-white text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            Nilai Tertinggi
                                        </button>
                                        <button
                                            onClick={() => setSortSudah('waktu_asc')}
                                            className={`px-3 py-1.5 border-l border-slate-200 transition-colors ${sortSudah === 'waktu_asc'
                                                    ? 'bg-[#1b5e20] text-white'
                                                    : 'bg-white text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            Terbaru
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {sortedSudah.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="pb-3 pr-4">Nama Siswa</th>
                                            <th className="pb-3 px-4">Nilai</th>
                                            <th className="pb-3 px-4">Benar/Salah</th>
                                            <th className="pb-3 px-4">Durasi</th>
                                            <th className="pb-3 pl-4 text-right">Laporan</th>
                                        </tr>
                                    </thead>
                                </table>
                                {/* Scrollable body — max 3 rows visible */}
                                <div className="overflow-y-auto" style={{ maxHeight: '195px' }}>
                                    <table className="w-full text-left border-collapse">
                                        <tbody className="divide-y divide-slate-100">
                                            {sortedSudah.map((sesi) => {
                                                const duration = sesi.waktu_selesai && sesi.waktu_mulai
                                                    ? Math.round((new Date(sesi.waktu_selesai) - new Date(sesi.waktu_mulai)) / 1000 / 60)
                                                    : null;

                                                return (
                                                    <tr key={sesi.id_sesi} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="py-4 pr-4">
                                                            <div className="font-semibold text-slate-900">{sesi.siswa?.nama}</div>
                                                            <div className="text-xs text-slate-500">{sesi.siswa?.email}</div>
                                                        </td>
                                                        <td className="py-4 px-4 whitespace-nowrap">
                                                            <span className="text-sm font-bold text-[#1b5e20]">
                                                                {sesi.hasil_latihan?.nilai_akhir ?? 0}%
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                    {sesi.hasil_latihan?.jumlah_benar ?? 0} B
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                                                    {sesi.hasil_latihan?.jumlah_salah ?? 0} S
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {duration !== null ? `${duration} Menit` : 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 pl-4 text-right whitespace-nowrap">
                                                            <button
                                                                onClick={() => openPreview(
                                                                    route('sesi-latihan.preview-siswa', sesi.id_sesi),
                                                                    route('sesi-latihan.export-siswa', sesi.id_sesi),
                                                                    `Laporan ${sesi.siswa?.nama ?? 'Siswa'} — ${paket.nama_paket}`
                                                                )}
                                                                className="inline-flex items-center gap-1.5 text-xs text-[#1b5e20] hover:text-[#144718] font-bold py-1 px-3.5 rounded-lg border border-green-200 bg-green-50/50 hover:bg-green-100 transition-colors"
                                                                title="Pratinjau & Ekspor Laporan Siswa"
                                                            >
                                                                <Eye size={13} />
                                                                Pratinjau
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {sortedSudah.length > 3 && (
                                    <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                                        Scroll untuk melihat {sortedSudah.length - 3} peserta lainnya
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-6">Belum ada siswa yang menyelesaikan latihan ini.</p>
                        )}
                    </div>

                    {/* Not Attempted List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Users className="text-slate-500" size={20} />
                            Belum Mengerjakan ({pesertaBelum.length})
                        </h2>
                        {pesertaBelum.length > 0 ? (
                            <>
                                <div
                                    className="grid gap-3 sm:grid-cols-2 overflow-y-auto pr-1"
                                    style={{ maxHeight: '201px' }}
                                >
                                    {pesertaBelum.map((siswa) => (
                                        <div key={siswa.id_siswa} className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between bg-slate-50/50">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">{siswa.nama}</div>
                                                <div className="text-xs text-slate-500">{siswa.email}</div>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                                                Belum Mulai
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {pesertaBelum.length > 3 && (
                                    <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                                        Scroll untuk melihat {pesertaBelum.length - 3} siswa lainnya
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">Semua siswa sudah mengerjakan latihan ini.</p>
                        )}
                    </div>

                    {/* Participant Performance Chart Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-slate-850 font-['Poppins']">Akurasi Seluruh Peserta per Soal</h2>
                            <p className="text-sm text-slate-500">Persentase peserta yang menjawab benar untuk setiap nomor soal</p>
                        </div>

                        <div className="flex gap-6 mb-8 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-emerald-500 block shadow-sm"></span>
                                <span>Persentase Benar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded bg-rose-500 block shadow-sm"></span>
                                <span>Persentase Salah</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-4 pt-6">
                            <div className="h-72 relative min-w-[600px] px-2">
                                {/* Grid lines background */}
                                <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                                    {[100, 75, 50, 25, 0].map((val) => (
                                        <div key={val} className="w-full flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{val}%</span>
                                            <div className="flex-1 border-t border-dashed border-slate-200/60"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Container */}
                                <div className="absolute inset-x-0 top-0 bottom-8 flex items-end justify-start gap-8 pl-10 pr-4">
                                    {questionStats.map((stat, i) => {
                                        const total = stat.jumlah_benar + stat.jumlah_salah;
                                        const accuracy = total > 0 ? Math.round((stat.jumlah_benar / total) * 100) : 0;

                                        return (
                                            <div key={stat.id_soal} className="flex flex-col items-center group relative w-12 h-full">
                                                {/* Tooltip */}
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 w-36 text-center">
                                                    <div className="bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700/50">
                                                        <p className="font-bold text-slate-200 mb-1">Soal #{i + 1}</p>
                                                        <p className="text-emerald-400 font-bold">{accuracy}% Benar</p>
                                                        <p className="text-slate-400 text-[10px] mt-0.5">({stat.jumlah_benar} Benar, {stat.jumlah_salah} Salah)</p>
                                                    </div>
                                                </div>

                                                {/* Bar Container */}
                                                <div className={`w-10 sm:w-12 rounded-t-xl h-full flex items-end relative overflow-hidden shadow-inner border border-slate-200/40 ${total > 0 ? 'bg-gradient-to-b from-rose-500 to-rose-400' : 'bg-slate-100/80'}`}>
                                                    <motion.div
                                                        initial={{ height: "0%" }}
                                                        animate={{ height: `${accuracy}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
                                                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 relative z-10"
                                                    ></motion.div>
                                                </div>

                                                {/* X-Label */}
                                                <span className="absolute top-full mt-2 text-xs font-bold text-slate-400 group-hover:text-slate-800 transition-colors">#{i + 1}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Question Statistics */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col gap-3 mb-4 border-b border-slate-100 pb-4">
                            <h3 className="font-semibold text-slate-950">Statistik Tiap Soal</h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari konten soal..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1b5e20] focus:border-[#1b5e20] transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredStats.length > 0 ? (
                                filteredStats.map((stat) => {
                                    const originalIdx = questionStats.findIndex(q => q.id_soal === stat.id_soal);
                                    const total = stat.jumlah_benar + stat.jumlah_salah;
                                    const rate = total > 0 ? Math.round((stat.jumlah_benar / total) * 100) : 0;

                                    return (
                                        <div key={stat.id_soal} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Soal {originalIdx + 1}</div>
                                            <div className="text-sm font-semibold text-slate-900 line-clamp-3" title={stat.konten_soal}>
                                                {stat.konten_soal}
                                            </div>
                                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 gap-4">
                                                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                                    <CheckCircle2 size={12} />
                                                    Benar: {stat.jumlah_benar}
                                                </span>
                                                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                                                    <XCircle size={12} />
                                                    Salah: {stat.jumlah_salah}
                                                </span>
                                            </div>
                                            {total > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                                                        <span>Tingkat Akurasi</span>
                                                        <span>{rate}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-[#1b5e20] h-1.5 rounded-full" style={{ width: `${rate}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-slate-400 py-8 text-sm">Tidak ada soal yang cocok dengan pencarian.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
