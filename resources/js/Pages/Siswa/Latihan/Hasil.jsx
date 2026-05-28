import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { ArrowLeft, Trophy, CheckCircle2, XCircle } from 'lucide-react';

export default function Hasil({ auth, paket, hasil, jawabanSiswa, questionStats }) {
    return (
        <SiswaLayout user={auth.user} header="Hasil Latihan">
            <Head title={`Hasil ${paket.nama_paket}`} />

            <div className="mb-6">
                <Link
                    href={route('siswa.latihan.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Latihan
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{paket.nama_paket}</h1>
                            <p className="mt-2 text-slate-600">Nilai akhir dan pembahasan jawaban.</p>
                        </div>
                        <div className="rounded-3xl bg-green-50 px-4 py-3 text-green-700 font-semibold">
                            {hasil.nilai_akhir}%
                        </div>
                    </div>

                    <div className="grid gap-4 mb-8 sm:grid-cols-3">
                        <div className="rounded-3xl border border-slate-200 p-5 text-center">
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Soal</div>
                            <div className="mt-3 text-3xl font-semibold text-slate-900">{hasil.total_soal}</div>
                        </div>
                        <div className="rounded-3xl border border-slate-200 p-5 text-center bg-emerald-50">
                            <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Benar</div>
                            <div className="mt-3 text-3xl font-semibold text-emerald-700">{hasil.jumlah_benar}</div>
                        </div>
                        <div className="rounded-3xl border border-slate-200 p-5 text-center bg-rose-50">
                            <div className="text-xs uppercase tracking-[0.18em] text-rose-700">Salah</div>
                            <div className="mt-3 text-3xl font-semibold text-rose-700">{hasil.jumlah_salah}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {jawabanSiswa.map((jawaban) => {
                            const soal = jawaban.soal;
                            const benar = jawaban.is_benar;
                            return (
                                <div key={jawaban.id_jawaban} className="rounded-3xl border border-slate-200 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{soal.konten_soal}</div>
                                            <div className="mt-2 text-sm text-slate-600">Kategori: {soal.kategori}</div>
                                        </div>
                                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${benar ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {benar ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            {benar ? 'Benar' : 'Salah'}
                                        </div>
                                    </div>

                                    {soal.jenis_soal === 'pilihan_ganda' ? (
                                        <div className="mt-4 text-sm text-slate-600">
                                            Jawaban siswa: {jawaban.pilihan_jawaban?.kode_pilihan}. {jawaban.pilihan_jawaban?.teks_pilihan || '-'}
                                        </div>
                                    ) : (
                                        <div className="mt-4 text-sm text-slate-600">Jawaban siswa: {jawaban.teks_jawaban || '-'}</div>
                                    )}

                                    <div className="mt-4 rounded-3xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700">
                                        <div className="font-medium text-slate-900">Pembahasan</div>
                                        <p className="mt-2">{soal.pembahasan || 'Pembahasan belum disediakan.'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Statistik Jawaban</h2>
                                <p className="text-sm text-slate-500">Data seluruh peserta per soal</p>
                            </div>
                            <Trophy size={28} className="text-amber-500" />
                        </div>
                        <div className="space-y-4">
                            {questionStats.map((stat) => (
                                <div key={stat.id_soal} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                                    <div className="text-sm font-medium text-slate-900">{stat.konten_soal}</div>
                                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600 gap-4">
                                        <span>Benar: {stat.jumlah_benar}</span>
                                        <span>Salah: {stat.jumlah_salah}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-slate-600">
                        <div className="text-sm font-semibold text-slate-900 mb-3">Catatan</div>
                        <p className="text-sm leading-6">Nilai akhir dihitung berdasarkan persentase jawaban benar terhadap total soal. Pastikan membaca pembahasan agar kamu lebih siap menghadapi materi UTBK berikutnya.</p>
                    </div>
                </div>
            </div>
        </SiswaLayout>
    );
}
