import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ auth, pakets }) {
    return (
        <AdminLayout user={auth.user} header="Manajemen Sesi Latihan">
            <Head title="Sesi Latihan" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Paket Latihan</h2>
                <div className="space-y-3">
                    {pakets.map((paket) => (
                        <div key={paket.id_paket} className="p-4 border rounded-xl flex items-center justify-between">
                            <div>
                                <div className="font-medium">{paket.nama_paket}</div>
                                <div className="text-sm text-slate-500">Soal aktif: {paket.soal_count}</div>
                            </div>
                            <Link href={route('sesi-latihan.show', paket.id_paket)} className="text-sm text-white bg-[#1b5e20] px-3 py-2 rounded-xl">Lihat Sesi</Link>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
