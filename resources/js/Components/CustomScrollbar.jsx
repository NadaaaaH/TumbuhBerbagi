import React, { forwardRef } from 'react';

/**
 * CustomScrollbar Component
 * Wrapped container for smooth, sleek, custom styled scrollbars.
 * 
 * Props:
 * - theme: 'dark' | 'light' | 'emerald' | 'amber' (default: 'light')
 * - direction: 'vertical' | 'horizontal' | 'both' (default: 'vertical')
 * - className: additional Tailwind classes
 * - maxHeight: optional inline CSS max-height
 * - maxWidth: optional inline CSS max-width
 */
const CustomScrollbar = forwardRef(function CustomScrollbar(
    {
        children,
        className = '',
        theme = 'light',
        direction = 'vertical',
        maxHeight,
        maxWidth,
        style,
        ...props
    },
    ref
) {
    const themeClasses = {
        light: 'scrollbar-custom-light',
        dark: 'scrollbar-custom-dark',
        emerald: 'scrollbar-custom-emerald',
        amber: 'scrollbar-custom-amber',
    };

    const selectedTheme = themeClasses[theme] || themeClasses.light;

    const overflowClass =
        direction === 'horizontal'
            ? 'overflow-x-auto overflow-y-hidden'
            : direction === 'both'
            ? 'overflow-auto'
            : 'overflow-y-auto';

    return (
        <div
            ref={ref}
            {...props}
            style={{ maxHeight, maxWidth, ...style }}
            className={`${overflowClass} ${selectedTheme} ${className}`}
        >
            {children}
        </div>
    );
});

export default CustomScrollbar;
