import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] pt-6 sm:pt-0 font-['Inter',sans-serif] relative overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f8f9fa] to-white"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#508953]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1b5e20]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10"></div>

            <div className="mb-8 relative z-10">
                <Link href="/" className="group flex flex-col items-center gap-4">
                    <img src="/images/logo.png" alt="Tumbuh Berbagi" className="h-16 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md overflow-hidden bg-white/80 backdrop-blur-md px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] border border-slate-100 relative z-10">
                {children}
            </div>
        </div>
    );
}
