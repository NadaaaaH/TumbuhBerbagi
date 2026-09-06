export default function ContainerWhite({ children, className = '', ...props }) {
    return (
        <div
            className={`group p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

