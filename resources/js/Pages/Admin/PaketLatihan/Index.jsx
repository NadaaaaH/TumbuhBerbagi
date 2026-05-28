import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ auth, pakets }) {
    return (
        <AdminLayout user={auth.user} header="Paket Latihan">
            <Head title="Paket Latihan" />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Daftar Paket Latihan</h2>
                    <Link href={route('paket-latihan.create')} className="text-sm text-white bg-[#1b5e20] px-4 py-2 rounded-xl">Buat Paket</Link>
                </div>

                <div className="space-y-3">
                    {pakets && pakets.length > 0 ? (
                        pakets.map((paket) => (
                            <div key={paket.id_paket} className="p-4 border rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{paket.nama_paket}</div>
                                    <div className="text-sm text-slate-500">Soal aktif: {paket.soal_count}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={route('sesi-latihan.show', paket.id_paket)} className="text-sm text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">Lihat</Link>
                                    <Link href={route('paket-latihan.edit', paket.id_paket)} className="text-sm text-white bg-[#1b5e20] px-3 py-2 rounded-xl">Edit</Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-slate-500">Belum ada paket latihan.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
