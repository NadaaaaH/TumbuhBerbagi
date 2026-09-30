import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/Components/RichTextEditor';
import SelectInput from '@/Components/SelectInput';
import MultiSelect from '@/Components/MultiSelect';
import PopupModal from '@/Components/PopupModal';
import ContainerWhite from '@/Components/ContainerWhite';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ auth, soal, pakets, referrer }) {
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    // Robustly pre-fill options A-E
    const initialPilihan = ['A', 'B', 'C', 'D', 'E'].map(code => {
        const found = soal?.pilihan_jawaban?.find(p => p.kode_pilihan === code);
        return {
            kode_pilihan: code,
            teks_pilihan: found ? found.teks_pilihan : ''
        };
    });

    const initialPaketIds = (soal?.paket_latihan && soal.paket_latihan.length > 0)
        ? soal.paket_latihan.map(p => p.id_paket)
        : (soal?.id_paket ? [soal.id_paket] : []);

    const { data, setData, put, transform, processing, errors } = useForm({
        id_paket: initialPaketIds,
        konten_soal: soal?.konten_soal || '',
        jenis_soal: soal?.jenis_soal || 'pilihan_ganda',
        kategori: soal?.kategori || 'PPU',
        materi: soal?.materi || '',
        tingkat_kesulitan: soal?.tingkat_kesulitan || 'medium',
        kunci_jawaban: soal?.kunci_jawaban || '',
        pembahasan: soal?.pembahasan || '',
        bobot_nilai: soal?.bobot_nilai || 10,
        is_case_sensitive: soal?.is_case_sensitive === 1 || soal?.is_case_sensitive === true,
        status: soal?.status || 'aktif',
        pilihan: initialPilihan,
        redirect_to: referrer || '',
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

        put(route('soal.update', soal.id_soal), {
            onError: () => {
                setIsErrorModalOpen(true);
            }
        });
    };

    const categories = ['PU', 'PPU', 'PK', 'PBM', 'Literasi Bahasa Indonesia', 'Literasi Bahasa Inggris', 'Penalaran Matematika'];

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3.5">
                    <Link href={route('soal.index')}>
                        <PrimaryButton className="gap-2 !py-2 !px-4 text-xs sm:text-sm font-semibold shadow-sm hover:shadow">
                            <ArrowLeft size={16} />
                            Kembali
                        </PrimaryButton>
                    </Link>
                    <span>Edit Soal UTBK</span>
                </div>
            }
        >
            <Head title="Edit Soal" />

            <div className="w-full">
                <ContainerWhite className="w-full !p-6 md:!p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Paket Latihan */}
                            <div>
                                <InputLabel htmlFor="id_paket" value="Paket Soal (Opsional - Bisa Pilih Banyak)" />
                                <MultiSelect
                                    options={pakets}
                                    value={data.id_paket}
                                    onChange={(vals) => setData('id_paket', vals)}
                                    placeholder="Pilih satu atau beberapa paket (opsional)..."
                                    className="mt-1"
                                />
                                <InputError message={errors.id_paket} className="mt-2" />
                            </div>

                            {/* Kategori */}
                            <div>
                                <InputLabel htmlFor="kategori" value="Kategori UTBK" />
                                <SelectInput
                                    id="kategori"
                                    className="mt-1 block w-full"
                                    value={data.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.kategori} className="mt-2" />
                            </div>

                            {/* Materi */}
                            <div>
                                <InputLabel htmlFor="materi" value="Materi (Opsional)" />
                                <TextInput
                                    id="materi"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.materi}
                                    onChange={(e) => setData('materi', e.target.value)}
                                    placeholder="Contoh: Aljabar, Tenses, dll."
                                />
                                <InputError message={errors.materi} className="mt-2" />
                            </div>

                            {/* Jenis Soal */}
                            <div>
                                <InputLabel htmlFor="jenis_soal" value="Tipe Soal" />
                                <SelectInput
                                    id="jenis_soal"
                                    className="mt-1 block w-full"
                                    value={data.jenis_soal}
                                    onChange={(e) => setData('jenis_soal', e.target.value)}
                                    required
                                >
                                    <option value="pilihan_ganda">Pilihan Ganda</option>
                                    <option value="isian">Isian Singkat</option>
                                </SelectInput>
                                <InputError message={errors.jenis_soal} className="mt-2" />
                            </div>

                            {/* Tingkat Kesulitan & Indeks */}
                            <div>
                                <InputLabel htmlFor="tingkat_kesulitan" value="Tingkat Kesulitan (Opsional)" />
                                <SelectInput
                                    id="tingkat_kesulitan"
                                    className="mt-1 block w-full"
                                    value={data.tingkat_kesulitan}
                                    onChange={(e) => setData('tingkat_kesulitan', e.target.value)}
                                >
                                    <option value="">-- Belum ditentukan --</option>
                                    <option value="mudah">Mudah</option>
                                    <option value="medium">Medium (Sedang)</option>
                                    <option value="sulit">Sulit</option>
                                </SelectInput>

                                {/* Auto-index info card */}
                                {soal?.tingkat_kesulitan_index !== null && soal?.tingkat_kesulitan_index !== undefined ? (
                                    <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2.5 ${
                                        soal.tingkat_kesulitan === 'mudah' ? 'bg-emerald-50 border-emerald-200' :
                                        soal.tingkat_kesulitan === 'sulit' ? 'bg-rose-50 border-rose-200' :
                                        'bg-amber-50 border-amber-200'
                                    }`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                            soal.tingkat_kesulitan === 'mudah' ? 'bg-emerald-100 text-emerald-800' :
                                            soal.tingkat_kesulitan === 'sulit' ? 'bg-rose-100 text-rose-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                            {soal.tingkat_kesulitan_index}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                Indeks Aktif: {soal.tingkat_kesulitan === 'mudah' ? 'Mudah' : soal.tingkat_kesulitan === 'sulit' ? 'Sulit' : 'Sedang'} — P = {soal.tingkat_kesulitan_index}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Dihitung dari tryout siswa. Nilai ini yang diutamakan dan menggantikan pilihan manual di atas.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                                        <span>ℹ️</span>
                                        Setelah soal dipakai di Try Out, tingkat kesulitan akan dihitung ulang otomatis (P-value) dan menggantikan pilihan manual di atas.
                                    </p>
                                )}
                                <InputError message={errors.tingkat_kesulitan} className="mt-2" />
                            </div>

                            {/* Status */}
                            <div>
                                <InputLabel value="Status" />
                                <div className="mt-2 flex items-center gap-4">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={data.status === 'aktif' || data.status === 'Aktif'}
                                        onClick={() => setData('status', (data.status === 'aktif' || data.status === 'Aktif') ? 'nonaktif' : 'aktif')}
                                        className={`relative inline-flex h-8 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b5e20] focus-visible:ring-offset-2 ${(data.status === 'aktif' || data.status === 'Aktif')
                                                ? 'bg-[#1b5e20] border-[#1b5e20]'
                                                : 'bg-slate-200 border-slate-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${(data.status === 'aktif' || data.status === 'Aktif')
                                                    ? 'translate-x-[40px]'
                                                    : 'translate-x-0.5'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-sm font-semibold transition-colors duration-200 ${(data.status === 'aktif' || data.status === 'Aktif')
                                            ? 'text-[#1b5e20]'
                                            : 'text-slate-400'
                                        }`}>
                                        {(data.status === 'aktif' || data.status === 'Aktif') ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>

                        {/* Pertanyaan */}
                        <div>
                            <InputLabel htmlFor="konten_soal" value="Pertanyaan (Konten Soal)" />
                            <div className="mt-1">
                                <RichTextEditor
                                    value={data.konten_soal}
                                    onChange={(value) => setData('konten_soal', value)}
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
                                    <SelectInput
                                        id="kunci_jawaban"
                                        className="mt-1 block w-full font-semibold text-slate-800"
                                        value={data.kunci_jawaban}
                                        onChange={(e) => setData('kunci_jawaban', e.target.value)}
                                        required
                                    >
                                        {data.pilihan.map((pil) => (
                                            <option key={pil.kode_pilihan} value={pil.kode_pilihan}>
                                                Pilihan {pil.kode_pilihan}
                                            </option>
                                        ))}
                                    </SelectInput>
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
                            <div className="mt-1">
                                <RichTextEditor
                                    value={data.pembahasan || ''}
                                    onChange={(value) => setData('pembahasan', value)}
                                    placeholder="Tuliskan penjelasan atau pembahasan soal di sini..."
                                />
                            </div>
                            <InputError message={errors.pembahasan} className="mt-2" />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                            <Link
                                href={route('soal.index')}
                                className="inline-flex items-center px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                className="gap-2 !py-2.5 !px-6 text-sm font-semibold shadow-sm hover:shadow-md"
                            >
                                <Save size={18} />
                                Simpan Perubahan
                            </PrimaryButton>
                        </div>
                    </form>
                </ContainerWhite>
            </div>

            {/* PopupModal Error Validasi */}
            <PopupModal
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                maxWidth="sm"
                showCloseButton={true}
                padding="p-7 sm:p-8"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertCircle size={28} strokeWidth={2.2} />
                    </div>

                    <h3 className="font-['Poppins'] text-xl font-bold text-slate-800 tracking-tight mb-2">
                        Gagal Menyimpan
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                        Terjadi kesalahan saat menyimpan soal. Silakan periksa kembali formulir Anda.
                    </p>

                    <PrimaryButton
                        type="button"
                        onClick={() => setIsErrorModalOpen(false)}
                        className="w-full !py-2.5 !px-6 text-sm font-semibold shadow-md active:scale-95 transition-all"
                    >
                        Saya Mengerti
                    </PrimaryButton>
                </div>
            </PopupModal>
        </AdminLayout>
    );
}
