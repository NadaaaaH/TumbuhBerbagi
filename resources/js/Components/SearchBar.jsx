import React from 'react';
import { Search } from 'lucide-react';
import TextInput from '@/Components/TextInput';

export default function SearchBar({
    value,
    onChange,
    onSubmit = (e) => e.preventDefault(),
    placeholder = 'Cari...',
    className = 'w-full sm:w-64', // Memberikan default width fleksibel
    ...props
}) {
    return (
        <form onSubmit={onSubmit} className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <TextInput
                type="text"
                placeholder={placeholder}
                className="w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border-slate-200 focus:!border-[#1b5e20] focus:!ring-[#1b5e20] text-sm transition-all"
                value={value}
                onChange={onChange}
                {...props}
            />
        </form>
    );
}
