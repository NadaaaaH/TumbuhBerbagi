export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-[#1b5e20] shadow-sm focus:ring-[#1b5e20] w-4 h-4 cursor-pointer ' +
                className
            }
        />
    );
}
