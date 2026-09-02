import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export default function FaqItem({ question, answer, index, isOpen, onToggle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className="border border-slate-100 rounded-2xl sm:rounded-3xl bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        >
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full p-6 sm:p-7 text-left focus:outline-none gap-4 group"
            >
                <span className="font-bold text-slate-800 text-base sm:text-lg font-['Poppins'] leading-snug">
                    {question}
                </span>
                
                {/* Plus / X Toggle Circle */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                    isOpen 
                        ? 'bg-[#fcc526] text-white shadow-sm' 
                        : 'bg-[#fef8e7] text-[#d99b00] group-hover:bg-[#fcc526] group-hover:text-white'
                }`}>
                    {isOpen ? <X size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </div>
            </button>
            
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="px-6 sm:px-7 pb-6 text-slate-500 text-sm sm:text-base leading-relaxed font-light border-t border-slate-100/60 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
