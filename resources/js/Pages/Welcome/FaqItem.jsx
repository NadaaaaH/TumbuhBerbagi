import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FaqItem({ question, answer, index }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="border border-slate-100 rounded-[1.5rem] bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-100/50"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
            >
                <span className="font-bold text-slate-800 text-sm sm:text-base font-['Poppins']">{question}</span>
                <div className={`w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 bg-emerald-50 text-[#1b5e20] border-emerald-100/50' : ''}`}>
                    <ChevronDown size={16} />
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
                        <div className="px-6 pb-6 pt-4 text-slate-500 text-sm sm:text-base leading-relaxed font-light border-t border-slate-50/50">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
