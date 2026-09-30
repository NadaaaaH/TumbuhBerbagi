import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    links = [],
    currentPage,
    totalPages,
    onPageChange,
    from = 0,
    to = 0,
    total = 0,
    itemName = 'data',
    className = ''
}) {
    const isClientSide = typeof onPageChange === 'function' && typeof totalPages === 'number';

    if (!isClientSide && (!links || links.length === 0)) {
        return null;
    }

    const getPageNumbers = (current, totalCount) => {
        if (totalCount <= 7) {
            return Array.from({ length: totalCount }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', totalCount];
        }
        if (current >= totalCount - 3) {
            return [1, '...', totalCount - 4, totalCount - 3, totalCount - 2, totalCount - 1, totalCount];
        }
        return [1, '...', current - 1, current, current + 1, '...', totalCount];
    };

    return (
        <div className={`p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 ${className}`}>
            <div className="text-slate-500 text-xs sm:text-sm">
                {total > 0 ? (
                    <>
                        Menampilkan <span className="font-semibold text-slate-800">{from}</span> - <span className="font-semibold text-slate-800">{to}</span> dari <span className="font-semibold text-slate-800">{total}</span> {itemName}
                    </>
                ) : (
                    <>Menampilkan 0 {itemName}</>
                )}
            </div>

            {isClientSide ? (
                totalPages > 1 && (
                    <nav className="flex items-center gap-1.5 flex-wrap justify-center">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className={`h-9 px-3 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl border transition-colors shadow-xs ${
                                currentPage <= 1
                                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed select-none'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                            }`}
                        >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline ml-1">Sebelumnya</span>
                        </button>

                        {getPageNumbers(currentPage, totalPages).map((page, idx) => {
                            if (page === '...') {
                                return (
                                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-sm select-none">
                                        ...
                                    </span>
                                );
                            }

                            const isActive = page === currentPage;
                            return (
                                <button
                                    type="button"
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-[36px] h-9 px-3 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl transition-colors shadow-xs ${
                                        isActive
                                            ? 'bg-[#1b5e20] text-white font-semibold shadow-sm'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className={`h-9 px-3 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl border transition-colors shadow-xs ${
                                currentPage >= totalPages
                                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed select-none'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                            }`}
                        >
                            <span className="hidden sm:inline mr-1">Selanjutnya</span>
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                )
            ) : (
                links.length > 3 && (
                    <nav className="flex items-center gap-1.5 flex-wrap justify-center">
                        {links.map((link, idx) => {
                            const isPrev = idx === 0 || link.label.toLowerCase().includes('prev');
                            const isNext = idx === links.length - 1 || link.label.toLowerCase().includes('next');
                            const isEllipsis = link.label === '...';

                            const content = isPrev ? (
                                <span className="flex items-center gap-1">
                                    <ChevronLeft size={16} />
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                </span>
                            ) : isNext ? (
                                <span className="flex items-center gap-1">
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <ChevronRight size={16} />
                                </span>
                            ) : (
                                link.label
                            );

                            if (isEllipsis) {
                                return (
                                    <span key={idx} className="px-2 py-1 text-slate-400 text-sm select-none">
                                        ...
                                    </span>
                                );
                            }

                            if (!link.url) {
                                return (
                                    <span
                                        key={idx}
                                        className={`h-9 px-3 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed select-none ${
                                            isPrev || isNext ? '' : 'min-w-[36px]'
                                        }`}
                                    >
                                        {content}
                                    </span>
                                );
                            }

                            if (link.active) {
                                return (
                                    <span
                                        key={idx}
                                        className="min-w-[36px] h-9 px-3 flex items-center justify-center text-xs sm:text-sm font-semibold rounded-xl bg-[#1b5e20] text-white shadow-sm"
                                        aria-current="page"
                                    >
                                        {content}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                    className={`h-9 px-3 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs ${
                                        isPrev || isNext ? '' : 'min-w-[36px]'
                                    }`}
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </nav>
                )
            )}
        </div>
    );
}
