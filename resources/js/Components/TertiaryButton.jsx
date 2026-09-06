export default function TertiaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#fef8e7] text-[#d99b00] border border-[#f5e6c4] hover:bg-[#fcc526] hover:text-white hover:border-[#fcc526] font-bold text-base shadow-sm hover:shadow-[0_10px_25px_rgba(252,197,38,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

