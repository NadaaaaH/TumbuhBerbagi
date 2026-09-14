import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';

export default function MultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = 'Pilih paket...',
    disabled = false,
    className = '',
    valueKey = 'id_paket',
    labelKey = 'nama_paket',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Normalize value to array of primitives (numbers/strings)
    const selectedValues = Array.isArray(value)
        ? value.map(v => (typeof v === 'object' && v !== null ? v[valueKey] : v))
        : (value ? [value] : []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt => {
        const label = opt[labelKey] || opt.label || '';
        return label.toLowerCase().includes(search.toLowerCase());
    });

    const toggleOption = (val) => {
        if (disabled) return;
        let next;
        if (selectedValues.includes(val)) {
            next = selectedValues.filter(v => v !== val);
        } else {
            next = [...selectedValues, val];
        }
        onChange(next);
    };

    const removeValue = (e, val) => {
        e.stopPropagation();
        if (disabled) return;
        onChange(selectedValues.filter(v => v !== val));
    };

    const clearAll = (e) => {
        e.stopPropagation();
        if (disabled) return;
        onChange([]);
    };

    const selectAllFiltered = () => {
        if (disabled) return;
        const filteredVals = filteredOptions.map(opt => opt[valueKey] ?? opt.value);
        const merged = Array.from(new Set([...selectedValues, ...filteredVals]));
        onChange(merged);
    };

    // Find option label for selected items
    const getOptionLabel = (val) => {
        const found = options.find(opt => (opt[valueKey] ?? opt.value) === val);
        return found ? (found[labelKey] ?? found.label) : val;
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Display Box */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`min-h-[46px] w-full rounded-xl border bg-white px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-all shadow-sm ${
                    disabled
                        ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                        : isOpen
                        ? 'border-[#1b5e20] ring-2 ring-[#1b5e20]/20'
                        : 'border-slate-200 hover:border-slate-300'
                }`}
            >
                {/* Badges / Placeholder */}
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    {selectedValues.length === 0 ? (
                        <span className="text-slate-400 text-sm font-normal select-none">
                            {placeholder}
                        </span>
                    ) : (
                        selectedValues.map(val => (
                            <span
                                key={val}
                                className="inline-flex items-center gap-1 bg-emerald-50 text-[#1b5e20] border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all animate-fadeIn"
                            >
                                <span className="max-w-[180px] truncate">{getOptionLabel(val)}</span>
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={(e) => removeValue(e, val)}
                                        className="hover:bg-emerald-200/60 rounded-full p-0.5 text-[#1b5e20] hover:text-emerald-900 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </span>
                        ))
                    )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {selectedValues.length > 0 && !disabled && (
                        <button
                            type="button"
                            onClick={clearAll}
                            title="Hapus semua pilihan"
                            className="hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1b5e20]' : ''}`}
                    />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                    {/* Search & Actions Header */}
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari paket..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20]"
                            />
                        </div>
                        <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-medium">
                            <button
                                type="button"
                                onClick={selectAllFiltered}
                                className="text-[#1b5e20] hover:underline font-semibold"
                            >
                                Pilih Semua
                            </button>
                            <span className="text-slate-300">|</span>
                            <span>
                                Terpilih: <strong className="text-[#1b5e20]">{selectedValues.length}</strong> dari {options.length}
                            </span>
                            <span className="text-slate-300">|</span>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-red-500 hover:underline font-semibold"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center py-4 text-xs text-slate-400">
                                Tidak ada paket latihan yang cocok.
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const optVal = opt[valueKey] ?? opt.value;
                                const optLabel = opt[labelKey] ?? opt.label;
                                const isSelected = selectedValues.includes(optVal);

                                return (
                                    <div
                                        key={optVal}
                                        onClick={() => toggleOption(optVal)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-emerald-50 text-[#1b5e20] font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <div
                                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                                    isSelected
                                                        ? 'bg-[#1b5e20] border-[#1b5e20] text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {isSelected && <Check size={11} strokeWidth={3} />}
                                            </div>
                                            <span className="truncate">{optLabel}</span>
                                        </div>

                                        {opt.tipe && (
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 uppercase tracking-wider ${
                                                    opt.tipe === 'tryout'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {opt.tipe}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
