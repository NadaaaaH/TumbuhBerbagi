import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SearchBar from '@/Components/SearchBar';
import SelectInput from '@/Components/SelectInput';
import Pagination from '@/Components/Pagination';
import PopupModal from '@/Components/PopupModal';
import CustomScrollbar from '@/Components/CustomScrollbar';
import {
    ArrowLeft,
    Download,
    Eye,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Award,
    Calendar,
    FileText,
    FileQuestion,
    Filter,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    Check,
    Loader2,
    X,
    Sparkles,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
//  HELPER FUNCTIONS
// ============================================================
function formatDurasi(minutes) {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '-';
    const m = Math.round(Number(minutes));
    if (m < 60) return `${m} Menit`;
    const jam = Math.floor(m / 60);
    const sisaMenit = m % 60;
    if (sisaMenit === 0) return `${jam} Jam`;
    return `${jam} Jam ${sisaMenit} Menit`;
}

function formatTanggal(dateStr) {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function formatWaktu(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function stripHtml(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function getStatusBadge(status) {
    switch (status) {
        case 'selesai':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#1b5e20] border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Selesai
                </span>
            );
        case 'sedang_mengerjakan':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Sedang Mengerjakan
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Belum Mulai
                </span>
            );
    }
}

function getDifficultyBadge(diff) {
    if (!diff) return null;
    const d = String(diff).toLowerCase();
    if (d === 'mudah') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Mudah
            </span>
        );
    }
    if (d === 'sulit') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Sulit
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Sedang
        </span>
    );
}

// ============================================================
//  PDF PREVIEW MODAL
// ============================================================
function PdfPreviewModal({ isOpen, onClose, previewUrl, downloadUrl, title }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
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
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
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
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Tutup"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 pointer-events-none"
                        style={{ top: '65px' }}
                    >
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
                        Pratinjau dokumen ini dibuat secara otomatis oleh sistem Tumbuh Berbagi. Klik{' '}
                        <strong className="text-slate-600">Unduh PDF</strong> untuk menyimpan dokumen.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function Show({
    auth,
    paket,
    summary = {},
    participants = {},
    filters = {},
    questionStats = [],
}) {
    // ── Tab State: 'peserta' | 'soal' ──────────────────────────
    const [activeTab, setActiveTab] = useState('peserta');

    // ── PDF Preview Modal State ───────────────────────────────
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
        setPreviewModal((prev) => ({ ...prev, open: false }));
    };

    // ── Detail Question Modal State ───────────────────────────
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

    const openQuestionDetail = (question, index) => {
        // Gabungkan data stat dengan data asli di paket.soal (jika ada info tambahan seperti pembahasan, pilihan, kunci)
        const fullSoal = (paket?.soal || []).find((s) => s.id_soal === question.id_soal) || {};
        setSelectedQuestion({
            ...question,
            ...fullSoal,
        });
        setSelectedQuestionIndex(index);
    };

    const closeQuestionDetail = () => {
        setSelectedQuestion(null);
        setSelectedQuestionIndex(null);
    };

    // ── Chart Visibility Toggle ───────────────────────────────
    const [showChart, setShowChart] = useState(true);

    const allPeserta = participants.data || [];
    const totalPeserta = summary.total || 0;
    const selesaiCount = summary.selesai || 0;
    const sedangCount = summary.sedang_mengerjakan || 0;
    const belumCount = summary.belum_mulai || 0;
    const completionRate = totalPeserta > 0 ? Math.round((selesaiCount / totalPeserta) * 100) : 0;
    const avgNilai = summary.rata_rata_nilai ?? null;

    const [pesertaSearch, setPesertaSearch] = useState(filters.search || '');
    const [pesertaStatusFilter, setPesertaStatusFilter] = useState(filters.status || '');
    const [pesertaSort, setPesertaSort] = useState(filters.sort || 'nilai_desc');
    const pesertaPage = participants.current_page || 1;
    const paginatedPeserta = allPeserta;
    const totalPesertaPages = participants.last_page || 1;
    const pesertaFrom = participants.from || 0;
    const pesertaTo = participants.to || 0;

    useEffect(() => {
        setPesertaSearch(filters.search || '');
        setPesertaStatusFilter(filters.status || '');
        setPesertaSort(filters.sort || 'nilai_desc');
    }, [filters.search, filters.status, filters.sort]);

    const visitParticipantPage = (page, nextFilters = {}) => {
        const query = {
            search: nextFilters.search ?? pesertaSearch,
            status: nextFilters.status ?? pesertaStatusFilter,
            sort: nextFilters.sort ?? pesertaSort,
            page,
        };
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        router.get(route('sesi-latihan.show', paket.id_paket), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['participants', 'filters'],
        });
    };

    useEffect(() => {
        if (pesertaSearch === (filters.search || '')) return;
        const timer = setTimeout(() => visitParticipantPage(1, { search: pesertaSearch }), 300);
        return () => clearTimeout(timer);
    }, [pesertaSearch]);

    // ── Tab 2: Question Stats Calculation & Filters ───────────
    const [soalSearch, setSoalSearch] = useState('');
    const [soalSubtesFilter, setSoalSubtesFilter] = useState('');
    const [soalAkurasiFilter, setSoalAkurasiFilter] = useState('all'); // 'all' | 'low' | 'high'
    const [soalSort, setSoalSort] = useState('index_asc');
    const [soalPage, setSoalPage] = useState(1);
    const SOAL_PER_PAGE = 10;

    // Reset pagination on filter change
    useEffect(() => {
        setSoalPage(1);
    }, [soalSearch, soalSubtesFilter, soalAkurasiFilter, soalSort]);

    // Enhanced Question Stats with linked full Soal
    const enhancedQuestionStats = useMemo(() => {
        return (questionStats || []).map((stat, i) => {
            const fullSoal = (paket?.soal || []).find((s) => s.id_soal === stat.id_soal) || {};
            const totalRespons = stat.jumlah_respons ?? (stat.jumlah_benar || 0) + (stat.jumlah_salah || 0);

            return {
                ...stat,
                fullSoal,
                index: i + 1,
                totalRespons,
                kategori: fullSoal.kategori || fullSoal.pivot?.subtes || null,
                tingkat_kesulitan: fullSoal.tingkat_kesulitan || null,
                pembahasan: fullSoal.pembahasan || null,
                kunci_jawaban: fullSoal.kunci_jawaban || null,
            };
        });
    }, [questionStats, paket?.soal]);

    // Question Stats Metrics
    const totalSoalCount = enhancedQuestionStats.length;
    const avgSoalAccuracy = useMemo(() => {
        const accuracies = enhancedQuestionStats
            .map((question) => question.akurasi)
            .filter((accuracy) => accuracy !== null && accuracy !== undefined);
        if (accuracies.length === 0) return null;
        return Math.round(accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / accuracies.length);
    }, [enhancedQuestionStats]);

    const lowAccuracyCount = useMemo(() => {
        return enhancedQuestionStats.filter((q) => q.totalRespons > 0 && q.akurasi < 40).length;
    }, [enhancedQuestionStats]);

    const noResponseCount = useMemo(() => {
        return enhancedQuestionStats.filter((q) => q.totalRespons === 0).length;
    }, [enhancedQuestionStats]);

    // Available subtest options
    const availableSubtests = useMemo(() => {
        const set = new Set();
        enhancedQuestionStats.forEach((q) => {
            if (q.kategori) set.add(q.kategori);
        });
        return Array.from(set);
    }, [enhancedQuestionStats]);

    // Filtered questions
    const filteredSoal = useMemo(() => {
        return enhancedQuestionStats
            .filter((q) => {
                if (soalSearch.trim()) {
                    const query = soalSearch.toLowerCase();
                    const cleanText = stripHtml(q.konten_soal).toLowerCase();
                    if (!cleanText.includes(query)) return false;
                }
                if (soalSubtesFilter && q.kategori !== soalSubtesFilter) {
                    return false;
                }
                if (soalAkurasiFilter === 'low' && (q.akurasi === null || q.akurasi >= 40)) {
                    return false;
                }
                if (soalAkurasiFilter === 'high' && (q.akurasi === null || q.akurasi < 70)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (soalSort === 'index_asc') return a.index - b.index;
                if (soalSort === 'index_desc') return b.index - a.index;
                if (soalSort === 'akurasi_asc') return (a.akurasi ?? Infinity) - (b.akurasi ?? Infinity);
                if (soalSort === 'akurasi_desc') return (b.akurasi ?? -Infinity) - (a.akurasi ?? -Infinity);
                if (soalSort === 'respons_desc') return b.totalRespons - a.totalRespons;
                return 0;
            });
    }, [enhancedQuestionStats, soalSearch, soalSubtesFilter, soalAkurasiFilter, soalSort]);

    const paginatedSoal = useMemo(() => {
        const start = (soalPage - 1) * SOAL_PER_PAGE;
        return filteredSoal.slice(start, start + SOAL_PER_PAGE);
    }, [filteredSoal, soalPage]);

    const totalSoalPages = Math.max(1, Math.ceil(filteredSoal.length / SOAL_PER_PAGE));
    const soalFrom = filteredSoal.length === 0 ? 0 : (soalPage - 1) * SOAL_PER_PAGE + 1;
    const soalTo = Math.min(soalPage * SOAL_PER_PAGE, filteredSoal.length);

    // Durasi & Periode Paket Display
    const isTryout = paket?.tipe === 'tryout';
    const durasiText = paket?.waktu_ujian
        ? `${paket.waktu_ujian} Menit`
        : isTryout
        ? '195 Menit'
        : 'Fleksibel';

    const periodeMulai = formatTanggal(paket?.tanggal_mulai || paket?.tanggal_aktif);
    const periodeSelesai = formatTanggal(paket?.tanggal_selesai);
    const periodeText =
        periodeMulai && periodeSelesai
            ? `${periodeMulai} - ${periodeSelesai}`
            : periodeMulai
            ? `Mulai ${periodeMulai}`
            : 'Fleksibel';

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3.5">
                    <Link href={route('sesi-latihan.index')}>
                        <PrimaryButton className="gap-2 !py-2 !px-4 text-xs sm:text-sm font-semibold shadow-sm hover:shadow">
                            <ArrowLeft size={16} />
                            Kembali
                        </PrimaryButton>
                    </Link>
                    <span className="truncate max-w-md">Hasil: {paket?.nama_paket}</span>
                </div>
            }
        >
            <Head title={`Hasil Sesi: ${paket?.nama_paket}`} />

            {/* ─── PDF PREVIEW MODAL ─────────────────────────────────────────── */}
            <PdfPreviewModal
                isOpen={previewModal.open}
                onClose={closePreview}
                previewUrl={previewModal.previewUrl}
                downloadUrl={previewModal.downloadUrl}
                title={previewModal.title}
            />

            {/* ─── DETAIL QUESTION POPUP MODAL ──────────────────────────────── */}
            <PopupModal
                isOpen={!!selectedQuestion}
                onClose={closeQuestionDetail}
                maxWidth="3xl"
                padding="p-0"
                className="!overflow-hidden"
            >
                {selectedQuestion && (
                    <div className="flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center font-bold text-sm">
                                    #{selectedQuestionIndex !== null ? selectedQuestionIndex : selectedQuestion.id_soal}
                                </div>
                                <div>
                                    <h3 className="font-['Poppins'] text-base font-bold text-slate-900 leading-snug">
                                        Detail Butir Soal #{selectedQuestionIndex !== null ? selectedQuestionIndex : selectedQuestion.id_soal}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {selectedQuestion.kategori && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fcc526] text-white">
                                                {selectedQuestion.kategori}
                                            </span>
                                        )}
                                        {getDifficultyBadge(selectedQuestion.tingkat_kesulitan)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <CustomScrollbar theme="light" maxHeight="calc(85vh - 140px)" className="p-6 space-y-6">
                            {/* Performance Stats Mini Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Respons</p>
                                    <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedQuestion.totalRespons || (selectedQuestion.jumlah_benar + selectedQuestion.jumlah_salah)}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Benar</p>
                                    <p className="text-lg font-bold text-emerald-700 mt-0.5">{selectedQuestion.jumlah_benar || 0}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
                                    <p className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Salah</p>
                                    <p className="text-lg font-bold text-rose-700 mt-0.5">{selectedQuestion.jumlah_salah || 0}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kosong</p>
                                    <p className="text-lg font-bold text-slate-700 mt-0.5">{selectedQuestion.jumlah_kosong || 0}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Akurasi</p>
                                    <p className="text-lg font-bold text-blue-700 mt-0.5">
                                        {selectedQuestion.akurasi !== null && selectedQuestion.akurasi !== undefined
                                            ? `${selectedQuestion.akurasi}%`
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Pertanyaan / Konten Soal */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <FileQuestion size={15} className="text-[#1b5e20]" />
                                    Isi Pertanyaan
                                </h4>
                                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                                    <div
                                        className="text-slate-800 text-sm sm:text-base leading-relaxed prose prose-slate max-w-none text-justify [&>p]:mb-2.5 prose-img:rounded-xl prose-img:max-h-[300px] prose-img:mx-auto prose-img:shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: selectedQuestion.konten_soal || '<p class="text-slate-400 italic">Tidak ada konten soal</p>' }}
                                    />
                                </div>
                            </div>

                            {/* Pilihan Jawaban (Jika Tersedia) */}
                            {Array.isArray(selectedQuestion.pilihan_jawaban) && selectedQuestion.pilihan_jawaban.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                                        Pilihan Jawaban
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedQuestion.pilihan_jawaban.map((opt) => {
                                            const isKey =
                                                selectedQuestion.kunci_jawaban &&
                                                (String(opt.kode_pilihan).toUpperCase() === String(selectedQuestion.kunci_jawaban).toUpperCase() ||
                                                    String(opt.id_pilihan) === String(selectedQuestion.kunci_jawaban));
                                            const distribution = selectedQuestion.pilihan?.find(
                                                (choice) => String(choice.id_pilihan) === String(opt.id_pilihan)
                                            );

                                            return (
                                                <div
                                                    key={opt.id_pilihan || opt.kode_pilihan}
                                                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                                                        isKey
                                                            ? 'border-emerald-300 bg-emerald-50/50 shadow-xs'
                                                            : 'border-slate-100 bg-white'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                                            isKey
                                                                ? 'bg-[#1b5e20] text-white'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {opt.kode_pilihan}
                                                    </span>
                                                    <div className="flex-1 text-sm text-slate-800 leading-relaxed pt-0.5">
                                                        {opt.teks_pilihan}
                                                    </div>
                                                    {isKey && (
                                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                                                            Kunci Jawaban
                                                        </span>
                                                    )}
                                                    {distribution && (
                                                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                                                            {distribution.jumlah} pemilih
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Kunci Jawaban Standar */}
                            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-emerald-700" />
                                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                                        Kunci Jawaban Resmi:
                                    </span>
                                </div>
                                <span className="font-extrabold text-base text-[#1b5e20] bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                                    {selectedQuestion.kunci_jawaban || '-'}
                                </span>
                            </div>

                            {/* Pembahasan / Penjelasan */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <HelpCircle size={15} className="text-[#1b5e20]" />
                                    Pembahasan Solusi
                                </h4>
                                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                    {selectedQuestion.pembahasan ? (
                                        <div
                                            className="text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none text-justify [&>p]:mb-2 prose-img:rounded-xl prose-img:max-h-[280px]"
                                            dangerouslySetInnerHTML={{ __html: selectedQuestion.pembahasan }}
                                        />
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">
                                            Belum ada pembahasan yang ditambahkan untuk butir soal ini.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CustomScrollbar>

                        {/* Modal Footer */}
                        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
                            <SecondaryButton onClick={closeQuestionDetail} className="!py-2 !px-4 text-xs font-semibold">
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </PopupModal>

            <div className="space-y-6">
                {/* ─────────────────────────────────────────────────────────────
                    1. HEADER SESI & METADATA
                ───────────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-7">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                                        isTryout
                                            ? 'bg-[#fcc526] text-white shadow-2xs'
                                            : 'bg-emerald-100 text-[#1b5e20]'
                                    }`}
                                >
                                    {isTryout ? 'Try Out UTBK' : 'Latihan Soal'}
                                </span>
                                {paket?.status && (
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            paket.status === 'aktif'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                paket.status === 'aktif' ? 'bg-emerald-600' : 'bg-slate-400'
                                            }`}
                                        />
                                        {paket.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                )}
                            </div>

                            <h1 className="font-['Poppins'] text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                                {paket?.nama_paket}
                            </h1>

                            {/* Meta Info Row */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500 pt-1">
                                <span className="flex items-center gap-1.5">
                                    <FileQuestion size={15} className="text-slate-400" />
                                    <span className="font-semibold text-slate-700">
                                        {paket?.soal?.length || questionStats.length}
                                    </span>{' '}
                                    Butir Soal
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={15} className="text-slate-400" />
                                    Durasi: <span className="font-semibold text-slate-700">{durasiText}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={15} className="text-slate-400" />
                                    Periode: <span className="font-semibold text-slate-700">{periodeText}</span>
                                </span>
                            </div>
                        </div>

                        {/* Export & Action Buttons */}
                        {selesaiCount > 0 && (
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() =>
                                        openPreview(
                                            route('sesi-latihan.preview-all', paket.id_paket),
                                            route('sesi-latihan.export-all', paket.id_paket),
                                            `Laporan Semua Peserta — ${paket.nama_paket}`
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 bg-[#1b5e20] hover:bg-[#144718] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                                >
                                    <Eye size={16} />
                                    <span>Pratinjau &amp; Ekspor Semua Peserta</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    2. RINGKASAN STATISTIK (5 METRIC CARDS)
                ───────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {/* 1. Total Peserta */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Total Peserta</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center">
                                <Users size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalPeserta}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Siswa terdaftar</p>
                        </div>
                    </div>

                    {/* 2. Selesai Mengerjakan */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Selesai</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{selesaiCount}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                                    {completionRate}%
                                </span>
                                <span className="text-[11px] text-slate-400">selesai</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Sedang Mengerjakan */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Sedang Mengerjakan</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{sedangCount}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Sesi berjalan</p>
                        </div>
                    </div>

                    {/* 4. Belum Mulai */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Belum Mulai</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                <Users size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{belumCount}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Belum mengakses</p>
                        </div>
                    </div>

                    {/* 5. Rata-rata Nilai */}
                    <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Rata-rata Nilai</span>
                            <div className="w-8 h-8 rounded-xl bg-[#fef8e7] text-[#d99b00] flex items-center justify-center">
                                <Award size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-[#1b5e20]">
                                {avgNilai !== null ? `${avgNilai}%` : '-'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {selesaiCount > 0 ? `Dari ${selesaiCount} peserta` : 'Belum ada data'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    3. TAB SWITCHER (PESERTA vs ANALISIS SOAL)
                ───────────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('peserta')}
                            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'peserta'
                                    ? 'border-[#1b5e20] text-[#1b5e20]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Users size={17} />
                            <span>Daftar Peserta</span>
                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    activeTab === 'peserta'
                                        ? 'bg-[#1b5e20]/10 text-[#1b5e20]'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {totalPeserta}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('soal')}
                            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'soal'
                                    ? 'border-[#1b5e20] text-[#1b5e20]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <FileQuestion size={17} />
                            <span>Analisis Butir Soal</span>
                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    activeTab === 'soal'
                                        ? 'bg-[#1b5e20]/10 text-[#1b5e20]'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {totalSoalCount}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    4. TAB CONTENT: PESERTA
                ───────────────────────────────────────────────────────────── */}
                {activeTab === 'peserta' && (
                    <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                        {/* Filter & Search Bar */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1 flex-wrap">
                                <SearchBar
                                    value={pesertaSearch}
                                    onChange={(e) => setPesertaSearch(e.target.value)}
                                    placeholder="Cari nama atau email siswa..."
                                    className="w-full sm:w-72"
                                />

                                <div className="w-full sm:w-48">
                                    <SelectInput
                                        value={pesertaStatusFilter}
                                        onChange={(e) => {
                                            const status = e.target.value;
                                            setPesertaStatusFilter(status);
                                            visitParticipantPage(1, { status });
                                        }}
                                        className="w-full text-xs sm:text-sm cursor-pointer"
                                    >
                                        <option value="">Semua Status ({totalPeserta})</option>
                                        <option value="selesai">Selesai ({selesaiCount})</option>
                                        <option value="sedang_mengerjakan">Sedang Mengerjakan ({sedangCount})</option>
                                        <option value="belum_mulai">Belum Mulai ({belumCount})</option>
                                    </SelectInput>
                                </div>

                                <div className="w-full sm:w-48">
                                    <SelectInput
                                        value={pesertaSort}
                                        onChange={(e) => {
                                            const sort = e.target.value;
                                            setPesertaSort(sort);
                                            visitParticipantPage(1, { sort });
                                        }}
                                        className="w-full text-xs sm:text-sm cursor-pointer"
                                    >
                                        <option value="nilai_desc">Nilai Tertinggi</option>
                                        <option value="nilai_asc">Nilai Terendah</option>
                                        <option value="nama_asc">Nama (A - Z)</option>
                                        <option value="nama_desc">Nama (Z - A)</option>
                                        <option value="terbaru">Terbaru Selesai</option>
                                    </SelectInput>
                                </div>
                            </div>
                        </div>

                        {/* Peserta Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3.5 w-12 text-center">#</th>
                                        <th className="px-5 py-3.5">Nama Peserta</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">Nilai</th>
                                        <th className="px-5 py-3.5">Benar / Salah</th>
                                        <th className="px-5 py-3.5">Durasi</th>
                                        <th className="px-5 py-3.5 text-right">Laporan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedPeserta.length > 0 ? (
                                        paginatedPeserta.map((peserta, idx) => {
                                            const rowNum = pesertaFrom + idx;

                                            return (
                                                <tr
                                                    key={peserta.id || idx}
                                                    className="hover:bg-slate-50/60 transition-colors"
                                                >
                                                    <td className="px-5 py-4 text-center whitespace-nowrap text-xs font-bold text-slate-400">
                                                        {rowNum}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-900 leading-snug">
                                                            {peserta.nama}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-0.5">
                                                            {peserta.email}
                                                        </div>
                                                        {peserta.aktivitas_terakhir && (
                                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                                {peserta.status === 'selesai' ? 'Submit' : 'Mulai'}:{' '}
                                                                {formatWaktu(peserta.aktivitas_terakhir)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {getStatusBadge(peserta.status)}
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {peserta.nilai !== null ? (
                                                            <span className="font-extrabold text-base text-[#1b5e20]">
                                                                {peserta.nilai}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {peserta.benar !== null ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                    {peserta.benar} B
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                                                    {peserta.salah} S
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                                                        {peserta.durasi !== null ? (
                                                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                                                                <Clock size={13} className="text-slate-400" />
                                                                {formatDurasi(peserta.durasi)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right whitespace-nowrap">
                                                        {peserta.canPreview && peserta.id_sesi ? (
                                                            <button
                                                                onClick={() =>
                                                                    openPreview(
                                                                        route('sesi-latihan.preview-siswa', peserta.id_sesi),
                                                                        route('sesi-latihan.export-siswa', peserta.id_sesi),
                                                                        `Laporan ${peserta.nama} — ${paket.nama_paket}`
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 text-xs text-[#1b5e20] hover:text-[#144718] font-bold py-1.5 px-3.5 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-100 transition-colors cursor-pointer"
                                                                title="Pratinjau & Ekspor Laporan Siswa"
                                                            >
                                                                <Eye size={13} />
                                                                Pratinjau
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">
                                                                Belum ada aksi
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 px-4 text-slate-400">
                                                <Users size={32} className="mx-auto mb-2 text-slate-300" />
                                                <p className="text-sm font-semibold text-slate-600">
                                                    Tidak ada data peserta yang cocok.
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Coba sesuaikan kata kunci pencarian atau filter status.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={pesertaPage}
                            totalPages={totalPesertaPages}
                            onPageChange={(p) => visitParticipantPage(p)}
                            from={pesertaFrom}
                            to={pesertaTo}
                            total={participants.total || 0}
                            itemName="peserta"
                        />
                    </ContainerWhite>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    5. TAB CONTENT: ANALISIS SOAL
                ───────────────────────────────────────────────────────────── */}
                {activeTab === 'soal' && (
                    <div className="space-y-6">
                        {/* Sub-Metrics Ringkasan Analisis Soal */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500">Total Butir Soal</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{totalSoalCount}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Soal aktif dalam paket</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500">Rata-rata Akurasi</p>
                                <p className="text-2xl font-bold text-[#1b5e20] mt-1">
                                    {avgSoalAccuracy === null ? '-' : `${avgSoalAccuracy}%`}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Tingkat keberhasilan siswa</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500">Akurasi Rendah (&lt; 40%)</p>
                                <p className="text-2xl font-bold text-rose-600 mt-1">{lowAccuracyCount}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Perlu perhatian / evaluasi</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500">Tanpa Respons</p>
                                <p className="text-2xl font-bold text-slate-700 mt-1">{noResponseCount}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Belum pernah dijawab</p>
                            </div>
                        </div>

                        {/* Performance Chart Card (Collapsible) */}
                        <ContainerWhite className="!p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-['Poppins'] text-base font-bold text-slate-900 flex items-center gap-2">
                                        <BarChart3 size={18} className="text-[#1b5e20]" />
                                        Grafik Akurasi Peserta per Nomor Soal
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Persentase perbandingan jawaban benar dan salah pada setiap butir soal
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowChart(!showChart)}
                                    className="text-xs font-bold text-[#1b5e20] hover:underline cursor-pointer"
                                >
                                    {showChart ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
                                </button>
                            </div>

                            {showChart && (
                                <div>
                                    <div className="flex items-center gap-6 mb-6 text-xs font-semibold text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded bg-emerald-500 block shadow-xs" />
                                            <span>Persentase Benar</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded bg-rose-500 block shadow-xs" />
                                            <span>Persentase Salah</span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto pb-4 pt-2">
                                        <div className="h-64 relative min-w-[620px] px-2">
                                            {/* Grid lines background */}
                                            <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                                                {[100, 75, 50, 25, 0].map((val) => (
                                                    <div key={val} className="w-full flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                                                            {val}%
                                                        </span>
                                                        <div className="flex-1 border-t border-dashed border-slate-200/70" />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Bars Container */}
                                            <div className="absolute inset-x-0 top-0 bottom-8 flex items-end justify-start gap-6 sm:gap-8 pl-10 pr-4">
                                                {enhancedQuestionStats.map((stat, i) => {
                                                    const accuracy = stat.akurasi ?? 0;
                                                    const total = stat.totalRespons;

                                                    return (
                                                        <div
                                                            key={stat.id_soal}
                                                            onClick={() => openQuestionDetail(stat, i + 1)}
                                                            className="flex flex-col items-center group relative w-10 sm:w-12 h-full cursor-pointer"
                                                        >
                                                            {/* Tooltip */}
                                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 w-36 text-center">
                                                                <div className="bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700/50">
                                                                    <p className="font-bold text-slate-200 mb-1">
                                                                        Soal #{i + 1}
                                                                    </p>
                                                                    <p className="text-emerald-400 font-bold">
                                                                        {stat.akurasi === null ? '-' : `${stat.akurasi}%`} Benar
                                                                    </p>
                                                                    <p className="text-slate-400 text-[10px] mt-0.5">
                                                                        ({stat.jumlah_benar} B, {stat.jumlah_salah} S)
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Bar Container */}
                                                            <div
                                                                className={`w-8 sm:w-10 rounded-t-xl h-full flex items-end relative overflow-hidden shadow-inner border border-slate-200/50 ${
                                                                    total > 0
                                                                        ? 'bg-gradient-to-b from-rose-500 to-rose-400'
                                                                        : 'bg-slate-100'
                                                                }`}
                                                            >
                                                                <motion.div
                                                                    initial={{ height: '0%' }}
                                                                    animate={{ height: `${accuracy}%` }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        delay: i * 0.03,
                                                                        ease: 'easeOut',
                                                                    }}
                                                                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 relative z-10"
                                                                />
                                                            </div>

                                                            {/* X-Label */}
                                                            <span className="absolute top-full mt-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                                                #{i + 1}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ContainerWhite>

                        {/* Questions Table Container */}
                        <ContainerWhite className="!p-0 overflow-hidden shadow-sm">
                            {/* Filter & Search Bar */}
                            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1 flex-wrap">
                                    <SearchBar
                                        value={soalSearch}
                                        onChange={(e) => setSoalSearch(e.target.value)}
                                        placeholder="Cari konten teks soal..."
                                        className="w-full sm:w-72"
                                    />

                                    {availableSubtests.length > 0 && (
                                        <div className="w-full sm:w-48">
                                            <SelectInput
                                                value={soalSubtesFilter}
                                                onChange={(e) => setSoalSubtesFilter(e.target.value)}
                                                className="w-full text-xs sm:text-sm cursor-pointer"
                                            >
                                                <option value="">Semua Subtes</option>
                                                {availableSubtests.map((sub) => (
                                                    <option key={sub} value={sub}>
                                                        {sub}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                        </div>
                                    )}

                                    <div className="w-full sm:w-48">
                                        <SelectInput
                                            value={soalAkurasiFilter}
                                            onChange={(e) => setSoalAkurasiFilter(e.target.value)}
                                            className="w-full text-xs sm:text-sm cursor-pointer"
                                        >
                                            <option value="all">Semua Akurasi</option>
                                            <option value="low">Akurasi Rendah (&lt;40%)</option>
                                            <option value="high">Akurasi Tinggi (&ge;70%)</option>
                                        </SelectInput>
                                    </div>

                                    <div className="w-full sm:w-48">
                                        <SelectInput
                                            value={soalSort}
                                            onChange={(e) => setSoalSort(e.target.value)}
                                            className="w-full text-xs sm:text-sm cursor-pointer"
                                        >
                                            <option value="index_asc">Nomor Soal (Terkecil)</option>
                                            <option value="index_desc">Nomor Soal (Terbesar)</option>
                                            <option value="akurasi_asc">Akurasi Terendah</option>
                                            <option value="akurasi_desc">Akurasi Tertinggi</option>
                                            <option value="respons_desc">Respons Terbanyak</option>
                                        </SelectInput>
                                    </div>
                                </div>
                            </div>

                            {/* Question Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm text-slate-600">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3.5 w-16 text-center">No</th>
                                            <th className="px-5 py-3.5 min-w-[280px]">Preview Teks Soal</th>
                                            <th className="px-5 py-3.5">Subtes / Kategori</th>
                                            <th className="px-5 py-3.5 text-center">Respons</th>
                                            <th className="px-5 py-3.5 text-center">Benar</th>
                                            <th className="px-5 py-3.5 text-center">Salah</th>
                                            <th className="px-5 py-3.5 text-center">Kosong</th>
                                            <th className="px-5 py-3.5 min-w-[140px]">Akurasi</th>
                                            <th className="px-5 py-3.5">Kesulitan</th>
                                            <th className="px-5 py-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedSoal.length > 0 ? (
                                            paginatedSoal.map((q) => {
                                                const cleanText = stripHtml(q.konten_soal) || '(Soal gambar/media tanpa teks)';
                                                const accuracyColor =
                                                    q.akurasi === null
                                                        ? 'bg-slate-300'
                                                        : q.akurasi >= 70
                                                        ? 'bg-emerald-500'
                                                        : q.akurasi >= 40
                                                        ? 'bg-amber-500'
                                                        : 'bg-rose-500';

                                                return (
                                                    <tr
                                                        key={q.id_soal}
                                                        className="hover:bg-slate-50/60 transition-colors"
                                                    >
                                                        <td className="px-5 py-4 text-center whitespace-nowrap font-bold text-xs text-slate-500">
                                                            #{q.index}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p
                                                                className="font-medium text-slate-900 line-clamp-2 leading-relaxed"
                                                                title={cleanText}
                                                            >
                                                                {cleanText}
                                                            </p>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            {q.kategori ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#fcc526] text-white">
                                                                    {q.kategori}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 text-xs italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-center whitespace-nowrap font-semibold text-slate-700">
                                                            {q.totalRespons}
                                                        </td>
                                                        <td className="px-5 py-4 text-center whitespace-nowrap font-semibold text-emerald-700">
                                                            {q.jumlah_benar}
                                                        </td>
                                                        <td className="px-5 py-4 text-center whitespace-nowrap font-semibold text-rose-700">
                                                            {q.jumlah_salah}
                                                        </td>
                                                        <td className="px-5 py-4 text-center whitespace-nowrap font-semibold text-slate-600">
                                                            {q.jumlah_kosong}
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex-1 bg-slate-100 rounded-full h-2 w-20 overflow-hidden">
                                                                    <div
                                                                        className={`h-2 rounded-full ${accuracyColor}`}
                                                                        style={{ width: `${Math.max(q.akurasi ?? 0, 4)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-800 w-9 text-right">
                                                                    {q.akurasi === null ? '-' : `${q.akurasi}%`}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            {getDifficultyBadge(q.tingkat_kesulitan) || (
                                                                <span className="text-slate-400 text-xs italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                                            <button
                                                                onClick={() => openQuestionDetail(q, q.index)}
                                                                className="inline-flex items-center gap-1.5 text-xs text-[#1b5e20] hover:text-[#144718] font-bold py-1.5 px-3 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-100 transition-colors cursor-pointer"
                                                                title="Buka Detail dan Pembahasan Soal"
                                                            >
                                                                <Eye size={13} />
                                                                Detail
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="text-center py-12 px-4 text-slate-400">
                                                    <FileQuestion size={32} className="mx-auto mb-2 text-slate-300" />
                                                    <p className="text-sm font-semibold text-slate-600">
                                                        Tidak ada butir soal yang cocok.
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Sesuaikan filter atau pencarian soal Anda.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={soalPage}
                                totalPages={totalSoalPages}
                                onPageChange={(p) => setSoalPage(p)}
                                from={soalFrom}
                                to={soalTo}
                                total={filteredSoal.length}
                                itemName="soal"
                            />
                        </ContainerWhite>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
