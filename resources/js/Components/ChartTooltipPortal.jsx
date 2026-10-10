import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

export default function ChartTooltipPortal({ anchor, children }) {
    const tooltipRef = useRef(null);
    const [position, setPosition] = useState(null);

    useLayoutEffect(() => {
        if (!anchor) return undefined;

        const updatePosition = () => {
            const anchorRect = anchor.getBoundingClientRect();
            const tooltipRect = tooltipRef.current?.getBoundingClientRect();
            const tooltipWidth = tooltipRect?.width || 192;
            const tooltipHeight = tooltipRect?.height || 0;
            const gap = 8;
            const aboveTop = anchorRect.top - tooltipHeight - gap;
            const placeAbove = aboveTop >= 8;
            const maxTop = Math.max(8, window.innerHeight - tooltipHeight - 8);
            const top = placeAbove
                ? Math.min(aboveTop, maxTop)
                : Math.min(anchorRect.bottom + gap, maxTop);
            const left = Math.min(
                Math.max(8, anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2),
                Math.max(8, window.innerWidth - tooltipWidth - 8)
            );

            const nextPosition = {
                top,
                left,
                arrowLeft: Math.min(
                    Math.max(12, anchorRect.left + anchorRect.width / 2 - left),
                    tooltipWidth - 12
                ),
                placeAbove,
            };
            setPosition((current) => {
                if (
                    current &&
                    current.top === nextPosition.top &&
                    current.left === nextPosition.left &&
                    current.arrowLeft === nextPosition.arrowLeft &&
                    current.placeAbove === nextPosition.placeAbove
                ) {
                    return current;
                }
                return nextPosition;
            });
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [anchor, position]);

    if (!anchor || !position || typeof document === 'undefined') return null;

    return createPortal(
        <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: position.placeAbove ? 6 : -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position.placeAbove ? 4 : -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] w-48 pointer-events-none text-center"
            style={{ top: position.top, left: position.left }}
        >
            {children}
            <div
                className={`absolute w-2.5 h-2.5 bg-white border-slate-200 rotate-45 shadow-2xs ${
                    position.placeAbove
                        ? 'bottom-[-5px] border-b border-r'
                        : 'top-[-5px] border-t border-l'
                }`}
                style={{ left: position.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }}
            />
        </motion.div>,
        document.body
    );
}
