import React from 'react';

export default function FirstIcon({
    icon: Icon,
    children,
    className = '',
    iconSize = 22,
    strokeWidth = 2.2,
    ...props
}) {
    return (
        <div
            className={
                `flex-shrink-0 w-12 h-12 rounded-2xl bg-[#fef8e7] text-[#d99b00] group-hover:bg-[#fcc526] group-hover:text-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${className}`
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
