import React from 'react';

/**
 * CustomScrollbar Component
 * Wrapped container for smooth, sleek, custom styled scrollbars.
 * 
 * Props:
 * - theme: 'dark' | 'light' | 'emerald' | 'amber' (default: 'light')
 * - className: additional Tailwind classes
 * - maxHeight: optional inline CSS max-height
 */
export default function CustomScrollbar({
    children,
    className = '',
    theme = 'light',
    maxHeight,
    style,
    ...props
}) {
    const themeClasses = {
        light: 'scrollbar-custom-light',
        dark: 'scrollbar-custom-dark',
        emerald: 'scrollbar-custom-emerald',
        amber: 'scrollbar-custom-amber',
    };

    const selectedTheme = themeClasses[theme] || themeClasses.light;

    return (
        <div
            {...props}
            style={{ maxHeight, ...style }}
            className={`overflow-y-auto ${selectedTheme} ${className}`}
        >
            {children}
        </div>
    );
}
