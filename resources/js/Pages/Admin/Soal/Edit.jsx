import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Konfigurasi toolbar untuk React Quill
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['image', 'link', 'formula'],
        ['clean']
    ],
};

export default function Edit({ auth, soal, pakets }) {
    // Robustly pre-fill options A-E
    const initialPilihan = ['A', 'B', 'C', 'D', 'E'].map(code => {
        const found = soal?.pilihan_jawaban?.find(p => p.kode_pilihan === code);
        return {
            kode_pilihan: code,
            teks_pilihan: found ? found.teks_pilihan : ''
        };
    });

    const { data, setData, put, transform, processing, errors } = useForm({
        id_paket: soal?.id_paket || '',
        konten_soal: soal?.konten_soal || '',
        jenis_soal: soal?.jenis_soal || 'pilihan_ganda',
        kategori: soal?.kategori || 'PPU',
        tingkat_kesulitan: soal?.tingkat_kesulitan || 'medium',
        kunci_jawaban: soal?.kunci_jawaban || '',
        pembahasan: soal?.pembahasan || '',
        bobot_nilai: soal?.bobot_nilai || 10,
        is_case_sensitive: soal?.is_case_sensitive === 1 || soal?.is_case_sensitive === true,
        status: soal?.status || 'aktif',
        pilihan: initialPilihan,
    });

    // Reset/Set default kunci_jawaban if type changes and is different from original
    useEffect(() => {
        if (data.jenis_soal !== soal.jenis_soal) {
            if (data.jenis_soal === 'pilihan_ganda') {
                setData('kunci_jawaban', 'A');
            } else {
                setData('kunci_jawaban', '');
            }
        } else {
            setData('kunci_jawaban', soal.kunci_jawaban);
        }
    }, [data.jenis_soal]);

    const handlePilihanChange = (index, value) => {
        const newPilihan = [...data.pilihan];
        newPilihan[index].teks_pilihan = value;
        setData('pilihan', newPilihan);
    };

    const submit = (e) => {
        e.preventDefault();
        
        transform((data) => {
            const payload = { ...data };
            if (data.jenis_soal !== 'pilihan_ganda') {
                delete payload.pilihan;
            }
            return payload;
        });

        put(route('soal.update', soal.id_soal));
    };

    const categories = ['PPU', 'PK', 'PBM', 'Literasi Bahasa Indonesia', 'Literasi Bahasa Inggris', 'Penalaran Matematika'];

    return (
        <AdminLayout user={auth.user} header="Edit Soal UTBK">
            <Head title="Edit Soal" />

            <div className="mb-6">
                <Link
                    href={route('soal.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Soal
                </Link>
            </div>

            <div className="max-w-4xl">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Paket Latihan */}
                            <div>
                                <InputLabel htmlFor="id_paket" value="Paket Latihan" />
                                <select
                                    id="id_paket"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    value={data.id_paket}
                                    onChange={(e) => setData('id_paket', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Pilih Paket Latihan</option>
                                    {pakets.map((paket) => (
                                        <option key={paket.id_paket} value={paket.id_paket}>
                                            {paket.nama_paket}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.id_paket} className="mt-2" />
                            </div>

                            {/* Kategori */}
                            <div>
                                <InputLabel htmlFor="kategori" value="Kategori UTBK" />
                                <select
                                    id="kategori"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    value={data.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kategori} className="mt-2" />
                            </div>

                            {/* Jenis Soal */}
                            <div>
                                <InputLabel htmlFor="jenis_soal" value="Tipe Soal" />
                                <select
                                    id="jenis_soal"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    value={data.jenis_soal}
                                    onChange={(e) => setData('jenis_soal', e.target.value)}
                                    required
                                >
                                    <option value="pilihan_ganda">Pilihan Ganda</option>
                                    <option value="isian">Isian Singkat</option>
                                </select>
                                <InputError message={errors.jenis_soal} className="mt-2" />
                            </div>

                            {/* Tingkat Kesulitan */}
                            <div>
                                <InputLabel htmlFor="tingkat_kesulitan" value="Tingkat Kesulitan" />
                                <select
                                    id="tingkat_kesulitan"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    value={data.tingkat_kesulitan}
                                    onChange={(e) => setData('tingkat_kesulitan', e.target.value)}
                                    required
                                >
                                    <option value="easy">Easy (Mudah)</option>
                                    <option value="medium">Medium (Sedang)</option>
                                    <option value="hard">Hard (Sulit)</option>
                                </select>
                                <InputError message={errors.tingkat_kesulitan} className="mt-2" />
                            </div>

                            {/* Bobot Nilai */}
                            <div>
                                <InputLabel htmlFor="bobot_nilai" value="Bobot Nilai" />
                                <TextInput
                                    id="bobot_nilai"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.bobot_nilai}
                                    onChange={(e) => setData('bobot_nilai', parseInt(e.target.value) || 0)}
                                    min="1"
                                    required
                                />
                                <InputError message={errors.bobot_nilai} className="mt-2" />
                            </div>

                            {/* Status */}
                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    required
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>

                        {/* Pertanyaan */}
                        <div>
                            <InputLabel htmlFor="konten_soal" value="Pertanyaan (Konten Soal)" />
                            <div className="mt-1 bg-white rounded-md">
                                <ReactQuill 
                                    theme="snow" 
                                    value={data.konten_soal} 
                                    onChange={(value) => setData('konten_soal', value)} 
                                    modules={modules}
                                    placeholder="Masukkan isi pertanyaan di sini (bisa sisipkan gambar)..."
                                />
                            </div>
                            <InputError message={errors.konten_soal} className="mt-2" />
                        </div>

                        {/* CONDITIONAL: Pilihan Ganda options list */}
                        {data.jenis_soal === 'pilihan_ganda' && (
                            <div className="border border-slate-100 rounded-3xl p-5 bg-slate-50/50 space-y-4">
                                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Pilihan Jawaban</h3>
                                {data.pilihan.map((pil, idx) => (
                                    <div key={pil.kode_pilihan} className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                                            {pil.kode_pilihan}
                                        </span>
                                        <TextInput
                                            type="text"
                                            className="block w-full"
                                            value={pil.teks_pilihan}
                                            onChange={(e) => handlePilihanChange(idx, e.target.value)}
                                            placeholder={`Teks pilihan ${pil.kode_pilihan}...`}
                                            required={data.jenis_soal === 'pilihan_ganda'}
                                        />
                                    </div>
                                ))}
                                <InputError message={errors.pilihan} className="mt-2" />
                            </div>
                        )}

                        {/* Kunci Jawaban & Case Sensitive */}
                        <div className="grid gap-6 md:grid-cols-2 items-end">
                            <div>
                                <InputLabel htmlFor="kunci_jawaban" value="Kunci Jawaban" />
                                {data.jenis_soal === 'pilihan_ganda' ? (
                                    <select
                                        id="kunci_jawaban"
                                        className="border-gray-300 focus:border-[#1b5e20] focus:ring-[#1b5e20] rounded-md shadow-sm mt-1 block w-full font-semibold text-slate-800"
                                        value={data.kunci_jawaban}
                                        onChange={(e) => setData('kunci_jawaban', e.target.value)}
                                        required
                                    >
                                        {data.pilihan.map((pil) => (
                                            <option key={pil.kode_pilihan} value={pil.kode_pilihan}>
                                                Pilihan {pil.kode_pilihan}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <TextInput
                                        id="kunci_jawaban"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.kunci_jawaban}
                                        onChange={(e) => setData('kunci_jawaban', e.target.value)}
                                        placeholder="Masukkan kata kunci jawaban singkat..."
                                        required
                                    />
                                )}
                                <InputError message={errors.kunci_jawaban} className="mt-2" />
                            </div>

                            {data.jenis_soal === 'isian' && (
                                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                                    <input
                                        id="is_case_sensitive"
                                        type="checkbox"
                                        checked={data.is_case_sensitive}
                                        onChange={(e) => setData('is_case_sensitive', e.target.checked)}
                                        className="h-4 w-4 text-[#1b5e20] border-slate-350 focus:ring-[#1b5e20] rounded"
                                    />
                                    <label htmlFor="is_case_sensitive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        Sensitif Huruf (Case Sensitive)
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Pembahasan */}
                        <div>
                            <InputLabel htmlFor="pembahasan" value="Pembahasan Soal" />
                            <div className="mt-1 bg-white rounded-md">
                                <ReactQuill 
                                    theme="snow" 
                                    value={data.pembahasan || ''} 
                                    onChange={(value) => setData('pembahasan', value)} 
                                    modules={modules}
                                    placeholder="Tuliskan penjelasan atau pembahasan soal di sini..."
                                />
                            </div>
                            <InputError message={errors.pembahasan} className="mt-2" />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6">
                            <Link
                                href={route('soal.index')}
                                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#1b5e20] hover:bg-[#508953] text-white px-8 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
