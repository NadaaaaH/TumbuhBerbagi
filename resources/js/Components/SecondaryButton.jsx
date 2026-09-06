export default function SecondaryButton({
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
                `inline-flex items-center justify-center rounded-full border border-[#f5e6c4] bg-[#fcc526] px-6 py-3 text-sm font-bold text-[#ffffff] transition-all duration-300 hover:bg-[#fef8e7] hover:text-[#d99b00] hover:border-[#fcc526] focus:bg-[#fcc526] focus:text-white focus:outline-none focus:ring-2 focus:ring-[#fcc526] focus:ring-offset-2 active:bg-[#d99b00] active:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 ${disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
