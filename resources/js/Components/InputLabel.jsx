export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-semibold text-slate-700 mb-1.5 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
