export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-[#1b5e20] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#144718] focus:bg-[#144718] focus:outline-none focus:ring-2 focus:ring-[#1b5e20] focus:ring-offset-2 active:bg-[#0d2e0f] shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
