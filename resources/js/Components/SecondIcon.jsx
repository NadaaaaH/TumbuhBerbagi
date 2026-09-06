import React from 'react';

export default function SecondIcon({
    icon: Icon,
    children,
    className = '',
    iconSize = 20,
    strokeWidth = 2,
    ...props
}) {
    return (
        <div
            className={
                `flex-shrink-0 w-10 h-10 rounded-xl bg-[#fef8e7] text-[#d99b00] flex items-center justify-center shadow-sm transition-colors duration-300 ${className}`
            }
            {...props}
        >
            {Icon ? (
                <Icon size={iconSize} strokeWidth={strokeWidth} />
            ) : (
                children
            )}
        </div>
    );
}
