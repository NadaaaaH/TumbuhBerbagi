import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ auth, paket }) {
    return (
        <AdminLayout user={auth.user} header={`Paket: ${paket?.nama_paket || ''}`}>
            <Head title={`Paket ${paket?.nama_paket || ''}`} />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold">{paket?.nama_paket}</h2>
                <p className="text-sm text-slate-600 mt-2">{paket?.deskripsi}</p>
            </div>
        </AdminLayout>
    );
}
