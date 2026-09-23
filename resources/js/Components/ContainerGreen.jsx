export default function ContainerGreen({ children, className = '', ...props }) {
    return (
        <div
            className={`group p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] border border-emerald-600/30 text-white shadow-lg shadow-[#1b5e20]/20 hover:shadow-xl hover:shadow-[#1b5e20]/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
