import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import ContainerGreen from '@/Components/ContainerGreen';
import FirstIcon from '@/Components/FirstIcon';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    Users,
    UserCheck,
    Trophy,
    Activity,
    Eye,
    BookOpen,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Info,
    Clock,
    Plus,
    FileQuestion,
    ChevronRight,
    ArrowUpRight,
    Sparkles,
    TrendingUp,
    ExternalLink,
    PlayCircle,
    LogIn,
    Bell,
    Check,
    HelpCircle,
    BarChart2,
    ListFilter,
    ShieldAlert,
    CheckCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard({ auth, dashboard = {} }) {
    // ── Unpack Dashboard Data dari DashboardService ──────────────────────────
    const {
        metrics = {},
        learningActivity = {},
        academicOverview = {},
        upcomingSchedules = [],
        recentPackages = [],
        needsAttention = [],
        problemQuestions = [],
        recentActivities = [],
        visitorSummary = {},
    } = dashboard || {};

    // ── State for Learning Activity Chart Filter ─────────────────────────────
    const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d'

    // ── 1. OVERVIEW METRICS (5 Consistent Cards) ─────────────────────────────
    const metricsCards = useMemo(() => {
        const totalSiswa = metrics.total_siswa ?? 0;
        const siswaAktif = metrics.siswa_aktif ?? 0;
        const siswaAktifDiff = metrics.siswa_aktif_diff;
        const tryoutAktif = metrics.tryout_aktif ?? 0;
        const aktivitasHariIni = metrics.aktivitas_hari_ini ?? 0;

        const aksesTotal = metrics.akses_hari_ini?.total ?? visitorSummary.today_total ?? 0;
        const aksesSiswa = metrics.akses_hari_ini?.siswa ?? visitorSummary.today_siswa ?? 0;
        const aksesTamu = metrics.akses_hari_ini?.tamu ?? visitorSummary.today_tamu ?? 0;

        return [
            {
                id: 'total-siswa',
                label: 'Total Siswa',
                value: Number(totalSiswa).toLocaleString('id-ID'),
                subtext: 'Terdaftar di platform',
                icon: Users,
            },
            {
                id: 'siswa-aktif',
                label: 'Siswa Aktif',
                value: Number(siswaAktif).toLocaleString('id-ID'),
                subtext: 'Aktivitas 7 hari terakhir',
                badgeText: siswaAktifDiff != null && siswaAktifDiff !== 0
                    ? (siswaAktifDiff > 0 ? `+${siswaAktifDiff} tren` : `${siswaAktifDiff} tren`)
                    : null,
                badgeColor: siswaAktifDiff > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold',
                icon: UserCheck,
            },
            {
                id: 'tryout-aktif',
                label: 'Tryout Aktif',
                value: Number(tryoutAktif).toLocaleString('id-ID'),
                subtext: 'Periode pengerjaan buka',
                icon: Trophy,
            },
            {
                id: 'aktivitas-hari-ini',
                label: 'Aktivitas Hari Ini',
                value: Number(aktivitasHariIni).toLocaleString('id-ID'),
                subtext: 'Sesi latihan & tryout',
                icon: Activity,
            },
            {
                id: 'akses-hari-ini',
                label: 'Akses Hari Ini',
                value: Number(aksesTotal).toLocaleString('id-ID'),
                isBreakdown: true,
                breakdownSiswa: Number(aksesSiswa).toLocaleString('id-ID'),
                breakdownTamu: Number(aksesTamu).toLocaleString('id-ID'),
                subtext: `${Number(aksesSiswa).toLocaleString('id-ID')} siswa · ${Number(aksesTamu).toLocaleString('id-ID')} tamu`,
                icon: Eye,
            }
        ];
    }, [metrics, visitorSummary]);

    // ── 2. LEARNING ACTIVITY CHART DATA ──────────────────────────────────────
    const chartSeries = useMemo(() => {
        const rawSeries = learningActivity?.[timeRange] || [];
        return rawSeries.map((item) => ({
            tanggal: item.label || item.date,
            fullDate: item.date,
            Latsol: Number(item.latsol || 0),
            Tryout: Number(item.tryout || 0),
            Total: Number(item.total || 0),
        }));
    }, [learningActivity, timeRange]);

    // Helper for Activity Icon & Color
    const getActivityBadge = (type) => {
        switch (type) {
            case 'login':
                return {
                    icon: <LogIn size={15} className="text-emerald-600" />,
                    bg: 'bg-emerald-50 border-emerald-100',
                };
            case 'mulai_latihan':
            case 'mulai_tryout':
                return {
                    icon: <PlayCircle size={15} className="text-blue-600" />,
                    bg: 'bg-blue-50 border-blue-100',
                };
            case 'selesai_latihan':
            case 'selesai_tryout':
                return {
                    icon: <CheckCircle2 size={15} className="text-[#d99b00]" />,
                    bg: 'bg-[#fef8e7] border-[#f5e6c4]',
                };
            default:
                return {
                    icon: <Bell size={15} className="text-amber-600" />,
                    bg: 'bg-amber-50 border-amber-100',
                };
        }
    };

    // Helper for Severity Alert
    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'danger':
                return {
                    badge: 'bg-emerald-50 text-[#1b5e20] border-emerald-200',
                    icon: <AlertCircle size={18} className="text-[#d99b00] shrink-0 mt-0.5" />,
                    label: 'Tinggi',
                };
            case 'warning':
                return {
                    badge: 'bg-emerald-50 text-[#1b5e20] border-emerald-200',
                    icon: <AlertTriangle size={18} className="text-[#d99b00] shrink-0 mt-0.5" />,
                    label: 'Sedang',
                };
            default:
                return {
                    badge: 'bg-emerald-50 text-[#1b5e20] border-emerald-200',
                    icon: <Info size={18} className="text-[#d99b00] shrink-0 mt-0.5" />,
                    label: 'Info',
                };
        }
    };

    // Custom Tooltip Recharts
    const CustomChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const latsolVal = payload.find((p) => p.dataKey === 'Latsol')?.value || 0;
            const tryoutVal = payload.find((p) => p.dataKey === 'Tryout')?.value || 0;
            const totalVal = latsolVal + tryoutVal;

            return (
                <div className="bg-white p-3.5 rounded-xl shadow-xl border border-slate-100 text-xs min-w-[170px]">
                    <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">
                        {label}
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#1b5e20]" />
                                Latihan Soal:
                            </span>
                            <span className="font-bold text-slate-900">{latsolVal}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#fcc526]" />
                                Try Out:
                            </span>
                            <span className="font-bold text-slate-900">{tryoutVal}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold text-slate-900">
                            <span>Total Aktivitas:</span>
                            <span className="text-[#1b5e20]">{totalVal}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout user={auth.user} header="Dashboard Admin" recentActivities={recentActivities}>
            <Head title="Admin Dashboard - TumbuhBerbagi" />

            <div className="space-y-8 pb-10">
                {/* ─────────────────────────────────────────────────────────────
                    1. HEADER SECTION & QUICK ACTIONS
                ───────────────────────────────────────────────────────────── */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 pb-2 border-b border-slate-200/80">
                    <div>
                        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                            Pusat pemantauan aktivitas belajar, performa tryout siswa, dan manajemen operasional platform TumbuhBerbagi secara real-time.
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
                        <Link href={route('soal.create')}>
                            <PrimaryButton className="!py-2.5 !px-4 !text-xs sm:!text-sm font-semibold gap-2 shadow-sm hover:shadow-md cursor-pointer">
                                <Plus size={16} strokeWidth={2.5} />
                                <span>Tambah Soal</span>
                            </PrimaryButton>
                        </Link>

                        <Link href={route('paket-latihan.create')}>
                            <SecondaryButton className="!py-2.5 !px-4 !text-xs sm:!text-sm font-bold gap-2 shadow-sm hover:shadow-md cursor-pointer">
                                <BookOpen size={16} strokeWidth={2.2} />
                                <span>Buat Latsol</span>
                            </SecondaryButton>
                        </Link>

                        <Link href={route('paket-tryout.create')}>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f5e6c4] bg-[#fef8e7] hover:bg-[#fcc526] hover:text-white hover:border-[#fcc526] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#d99b00] transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                            >
                                <Trophy size={16} strokeWidth={2.2} />
                                <span>Buat Tryout</span>
                            </button>
                        </Link>

                        <Link href={route('jadwal.create')}>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                            >
                                <Calendar size={16} strokeWidth={2.2} />
                                <span>Tambah Jadwal</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    2. OVERVIEW METRICS (5 Consistent Cards)
                ───────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                    {metricsCards.map((metric, idx) => (
                        <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            whileHover={{ y: -6, scale: 1.015 }}
                        >
                            <ContainerWhite className="h-full flex flex-col justify-between !p-5 sm:!p-6 group cursor-pointer">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {metric.label}
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                                {metric.value}
                                            </h3>
                                        </div>
                                    </div>
                                    <FirstIcon icon={metric.icon} className="!w-11 !h-11" iconSize={22} strokeWidth={2.2} />
                                </div>

                                {/* Bottom info / breakdown */}
                                {metric.isBreakdown ? (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span><strong className="text-slate-800 font-semibold">{metric.breakdownSiswa}</strong> siswa</span>
                                        </div>
                                        <span className="text-slate-300">•</span>
                                        <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            <span><strong className="text-slate-800 font-semibold">{metric.breakdownTamu}</strong> tamu</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium truncate">
                                            {metric.subtext}
                                        </span>
                                        {metric.badgeText && (
                                            <span className={`text-xs ${metric.badgeColor}`}>
                                                {metric.badgeText}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </ContainerWhite>
                        </motion.div>
                    ))}
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    MAIN DASHBOARD GRID LAYOUT
                    2/3 Left Column: Learning Activity, Recent Packages, Problem Questions
                    1/3 Right Column: Academic Overview, Needs Attention, Upcoming Schedule, Recent Activity
                ───────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ═══════════════════════════════════════════════════════════
                        LEFT COLUMN (2 COLS ON DESKTOP)
                    ════════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* ─────────────────────────────────────────────────────
                            3. LEARNING ACTIVITY CHART
                        ───────────────────────────────────────────────────── */}
                        <ContainerWhite className="!p-6 sm:!p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-[#fef8e7] text-[#d99b00] border border-[#f5e6c4] flex items-center justify-center">
                                            <Activity size={18} strokeWidth={2.4} />
                                        </div>
                                        <h2 className="font-['Poppins'] text-lg sm:text-xl font-bold text-slate-900">
                                            Aktivitas Belajar
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Perbandingan volume pengerjaan Latihan Soal dan Tryout siswa dari database
                                    </p>
                                </div>

                                {/* Filter Controls [7 Hari] [30 Hari] */}
                                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setTimeRange('7d')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === '7d'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        7 Hari
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimeRange('30d')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === '30d'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        30 Hari
                                    </button>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="h-72 sm:h-80 w-full pt-2">
                                {chartSeries.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={chartSeries}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorLatsol" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#1b5e20" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#1b5e20" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="colorTryout" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#fcc526" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#fcc526" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="tanggal"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                                dy={8}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Legend
                                                verticalAlign="top"
                                                align="right"
                                                iconType="circle"
                                                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 600 }}
                                                formatter={(value) => (
                                                    <span className="text-slate-700 ml-1">
                                                        {value === 'Latsol' ? 'Latihan Soal' : 'Try Out UTBK'}
                                                    </span>
                                                )}
                                            />
                                            <Area
                                                type="monotone"
                                                name="Latsol"
                                                dataKey="Latsol"
                                                stroke="#1b5e20"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorLatsol)"
                                                activeDot={{ r: 5, strokeWidth: 2, fill: '#1b5e20', stroke: '#ffffff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                name="Tryout"
                                                dataKey="Tryout"
                                                stroke="#d99b00"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorTryout)"
                                                activeDot={{ r: 5, strokeWidth: 2, fill: '#d99b00', stroke: '#ffffff' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                                        Belum ada rekaman aktivitas belajar pada rentang waktu ini.
                                    </div>
                                )}
                            </div>
                        </ContainerWhite>

                        {/* ─────────────────────────────────────────────────────
                            6. RECENT PACKAGES (Table / List)
                        ───────────────────────────────────────────────────── */}
                        <ContainerWhite className="!p-0 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-[#fef8e7] text-[#d99b00] border border-[#f5e6c4] flex items-center justify-center">
                                            <BookOpen size={18} strokeWidth={2.4} />
                                        </div>
                                        <h2 className="font-['Poppins'] text-lg sm:text-xl font-bold text-slate-900">
                                            Paket Terbaru
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                        Daftar paket latihan soal dan simulasi tryout yang baru dibuat
                                    </p>
                                </div>
                            </div>

                            {/* Responsive Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Nama Paket</th>
                                            <th className="px-5 py-3.5">Tipe</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5">Peserta</th>
                                            <th className="px-5 py-3.5">Durasi</th>
                                            <th className="px-6 py-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentPackages && recentPackages.length > 0 ? (
                                            recentPackages.map((pkg) => {
                                                const isTryout = pkg.tipe === 'tryout';
                                                const isAktif = pkg.status === 'aktif';

                                                return (
                                                    <tr
                                                        key={pkg.id_paket}
                                                        className="hover:bg-slate-50/60 transition-colors group"
                                                    >
                                                        <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                                                            <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-[#1b5e20] transition-colors">
                                                                {pkg.nama_paket}
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-0.5">
                                                                <span>{pkg.soal_count || 0} Soal</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${isTryout
                                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                    }`}
                                                            >
                                                                {pkg.tipe_label || (isTryout ? 'Tryout' : 'Latsol')}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${isAktif
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                                    }`}
                                                            >
                                                                {isAktif ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                                                <Users size={14} className="text-slate-400" />
                                                                <span>{pkg.participants} Siswa</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                                <Clock size={14} className="text-slate-400" />
                                                                <span>{pkg.duration}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <Link
                                                                href={route('paket-latihan.show', pkg.id_paket)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144718] transition-all shadow-xs"
                                                            >
                                                                <span>Detail</span>
                                                                <ArrowUpRight size={13} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                                                    Belum ada data paket soal yang dibuat.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </ContainerWhite>

                        {/* ─────────────────────────────────────────────────────
                            8. PROBLEM QUESTIONS (Lowest Accuracy Questions)
                        ───────────────────────────────────────────────────── */}
                        <ContainerGreen className="!p-6 sm:!p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 text-[#fcc526] border border-white/20 flex items-center justify-center">
                                            <FileQuestion size={18} strokeWidth={2.4} />
                                        </div>
                                        <h2 className="font-['Poppins'] text-lg sm:text-xl font-bold text-white">
                                            Soal Perlu Evaluasi
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                                        Daftar butir soal dengan tingkat akurasi terendah dari database pengerjaan siswa
                                    </p>
                                </div>

                                <Link
                                    href={route('soal.index')}
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#fcc526] hover:text-white hover:underline transition-colors shrink-0"
                                >
                                    <span>Bank Soal Lengkap</span>
                                    <ChevronRight size={16} />
                                </Link>
                            </div>

                            {/* Problem Questions Grid */}
                            {problemQuestions && problemQuestions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {problemQuestions.map((q) => (
                                        <div
                                            key={q.id_soal}
                                            className="p-4 rounded-2xl bg-white flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-[#1b5e20] text-sm">
                                                            {q.title
                                                                ? q.title.replace(/^Question\s*#?/i, 'Soal ')
                                                                : `Soal #${q.id_soal}`}
                                                        </h3>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {q.tingkat_kesulitan || 'Sedang'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
                                                        {q.kategori} {q.preview && `• ${q.preview}`}
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-xs font-bold text-rose-600">
                                                        Akurasi {q.accuracy_pct}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar & Attempts */}
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.max(q.accuracy_pct, 4)}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-slate-500">
                                                    <span className="font-medium">
                                                        {q.total_siswa ?? q.total_attempts} siswa mengerjakan
                                                    </span>
                                                    <Link
                                                        href={route('soal.index')}
                                                        className="font-bold text-[#1b5e20] hover:underline flex items-center gap-0.5 text-xs"
                                                    >
                                                        Evaluasi <ArrowUpRight size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-white/60 text-xs border border-dashed border-white/20 rounded-2xl">
                                    Belum ada butir soal dengan tingkat akurasi rendah yang memerlukan evaluasi.
                                </div>
                            )}
                        </ContainerGreen>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        RIGHT COLUMN (1 COL ON DESKTOP)
                    ════════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* ─────────────────────────────────────────────────────
                            4. ACADEMIC OVERVIEW
                        ───────────────────────────────────────────────────── */}
                        <ContainerGreen className="!p-6 sm:!p-7">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-[#fef8e7] text-[#d99b00] border border-[#f5e6c4] flex items-center justify-center">
                                    <Trophy size={18} strokeWidth={2.4} />
                                </div>
                                <h2 className="font-['Poppins'] text-lg font-bold text-white">
                                    Ringkasan Akademik
                                </h2>
                            </div>

                            <p className="text-xs text-emerald-100/90 mb-5 leading-relaxed">
                                Ringkasan capaian nilai & akurasi pengerjaan siswa pada tryout terkini:
                            </p>

                            {academicOverview?.has_data ? (
                                <div className="space-y-3.5">
                                    {/* Latest Tryout Box */}
                                    <div className="p-3.5 rounded-2xl bg-white shadow-sm flex items-start justify-between gap-3 text-slate-800">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                                Latest Tryout
                                            </p>
                                            <p className="font-bold text-sm text-slate-900 mt-0.5">
                                                {academicOverview.tryout_nama}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {academicOverview.tanggal_mulai || 'Periode Berjalan'}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                            {academicOverview.status || 'Aktif'}
                                        </span>
                                    </div>

                                    {/* 2 Mini Metrics in Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Average Score */}
                                        <div className="p-3.5 rounded-2xl bg-white shadow-sm text-slate-800">
                                            <p className="text-[11px] font-semibold text-slate-500">
                                                Average Score
                                            </p>
                                            <p className="text-xl font-black text-slate-900 mt-1">
                                                {academicOverview.avg_score}
                                            </p>
                                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                                Max: {academicOverview.highest}
                                            </p>
                                        </div>

                                        {/* Average Accuracy */}
                                        <div className="p-3.5 rounded-2xl bg-white shadow-sm text-slate-800">
                                            <p className="text-[11px] font-semibold text-slate-500">
                                                Avg. Accuracy
                                            </p>
                                            <p className="text-xl font-black text-slate-900 mt-1">
                                                {academicOverview.avg_accuracy}%
                                            </p>
                                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                                Target: &gt;70%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Participants Summary */}
                                    <div className="p-3.5 rounded-2xl bg-white shadow-sm flex items-center justify-between text-slate-800">
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-500">
                                                Total Participants
                                            </p>
                                            <p className="text-base font-extrabold text-slate-900 mt-0.5">
                                                {Number(academicOverview.participants || 0).toLocaleString('id-ID')} Siswa
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                                                {academicOverview.submission_rate} selesai
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-white/80 border border-dashed border-white/20 rounded-2xl bg-white/5">
                                    Belum ada data pengerjaan tryout yang telah diselesaikan.
                                </div>
                            )}
                        </ContainerGreen>

                        {/* ─────────────────────────────────────────────────────
                            7. NEEDS ATTENTION
                        ───────────────────────────────────────────────────── */}
                        <ContainerWhite className="!p-6 sm:!p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#fef8e7] text-[#d99b00] border border-[#f5e6c4] flex items-center justify-center">
                                        <AlertTriangle size={18} strokeWidth={2.4} />
                                    </div>
                                    <h2 className="font-['Poppins'] text-lg font-bold text-slate-900">
                                        Perlu Perhatian
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-rose-600">
                                    {needsAttention.length} Isu
                                </span>
                            </div>

                            <p className="text-xs text-slate-500 mb-4">
                                Peringatan sistem dari database yang memerlukan tindak lanjut admin:
                            </p>

                            {needsAttention && needsAttention.length > 0 ? (
                                <div className="space-y-3">
                                    {needsAttention.map((item) => {
                                        const meta = getSeverityBadge(item.severity);

                                        return (
                                            <div
                                                key={item.id}
                                                className="p-3.5 rounded-2xl bg-[#fef8e7] border border-[#f5e6c4] transition-all duration-200 hover:shadow-xs"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {meta.icon}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xs font-bold text-slate-900 leading-snug">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                        {item.disclaimer && (
                                                            <div className="mt-2 text-[11px] text-slate-600 leading-relaxed">
                                                                <span className="font-bold text-slate-800 block mb-0.5">
                                                                    Catatan:
                                                                </span>
                                                                {item.disclaimer}
                                                            </div>
                                                        )}
                                                        {item.actionLabel && (
                                                            <div className="mt-2.5">
                                                                <Link
                                                                    href={item.href || '#'}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1b5e20] hover:text-[#144718] hover:underline"
                                                                >
                                                                    <span>{item.actionLabel}</span>
                                                                    <ArrowUpRight size={12} />
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3 text-emerald-800 text-xs">
                                    <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                                    <span>Semua sistem berjalan lancar. Tidak ada isu kritis yang memerlukan perhatian.</span>
                                </div>
                            )}
                        </ContainerWhite>

                        {/* ─────────────────────────────────────────────────────
                            5. UPCOMING SCHEDULE
                        ───────────────────────────────────────────────────── */}
                        <ContainerWhite className="!p-6 sm:!p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#fef8e7] text-[#d99b00] border border-[#f5e6c4] flex items-center justify-center">
                                        <Calendar size={18} strokeWidth={2.4} />
                                    </div>
                                    <h2 className="font-['Poppins'] text-lg font-bold text-slate-900">
                                        Jadwal Mendatang
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {upcomingSchedules && upcomingSchedules.length > 0 ? (
                                    upcomingSchedules.map((sch) => (
                                        <div
                                            key={sch.id_jadwal}
                                            className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-xs text-slate-900 line-clamp-1">
                                                    {sch.nama_jadwal}
                                                </h3>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${sch.status === 'aktif'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}
                                                >
                                                    {sch.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {sch.label_hari || sch.tanggal}
                                                </span>
                                                {sch.waktu_mulai && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-slate-400" />
                                                        {sch.waktu_mulai} {sch.waktu_selesai ? `- ${sch.waktu_selesai}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                                        Tidak ada jadwal mentoring mendatang.
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 mt-2 border-t border-slate-100">
                                <Link
                                    href={route('jadwal.index')}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b5e20] hover:text-[#144718] hover:underline transition-colors"
                                >
                                    <span>Lihat semua jadwal →</span>
                                </Link>
                            </div>
                        </ContainerWhite>


                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
