import AdminLayout from '@/Layouts/AdminLayout';
import ContainerWhite from '@/Components/ContainerWhite';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import FirstIcon from '@/Components/FirstIcon';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

function SecretField({ id, label, value, onChange, error, numeric = false, autoComplete }) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <div className="relative mt-1">
                <TextInput
                    id={id}
                    type={visible ? 'text' : 'password'}
                    inputMode={numeric ? 'numeric' : undefined}
                    pattern={numeric ? '[0-9]*' : undefined}
                    maxLength={numeric ? 12 : 100}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete || (numeric ? 'off' : 'new-password')}
                    className="block w-full pr-12"
                    required
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? 'Sembunyikan input' : 'Tampilkan input'}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-800"
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <InputError message={error} className="mt-2" />
        </div>
    );
}

function SectionHeader({ icon: Icon, title, description }) {
    return (
        <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-4">
            <FirstIcon icon={Icon} className="!h-11 !w-11 !rounded-xl !bg-[#fef8e7] !text-[#d99b00] group-hover:!bg-[#fcc526] group-hover:!text-white" iconSize={21} />
            <div>
                <h2 className="font-['Poppins'] text-lg font-bold text-slate-800">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );
}

export default function ManageAdmin({ auth, verified, email, pendingEmail }) {
    const { props } = usePage();
    const pinForm = useForm({ pin: '' });
    const emailForm = useForm({ email: '' });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const changePinForm = useForm({
        current_pin: '',
        pin: '',
        pin_confirmation: '',
    });
    const flash = props.flash || {};

    const submitPin = (event) => {
        event.preventDefault();
        pinForm.post(route('admin.manage-admin.verify-pin'), {
            onSuccess: () => pinForm.reset(),
        });
    };

    const submitEmail = (event) => {
        event.preventDefault();
        emailForm.put(route('admin.manage-admin.email'), {
            preserveScroll: true,
            onSuccess: () => emailForm.reset(),
        });
    };

    const submitPassword = (event) => {
        event.preventDefault();
        passwordForm.put(route('admin.manage-admin.password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const submitPinChange = (event) => {
        event.preventDefault();
        changePinForm.put(route('admin.manage-admin.pin'), {
            preserveScroll: true,
            onSuccess: () => changePinForm.reset(),
        });
    };

    return (
        <AdminLayout user={auth.user} header="Kelola Admin">
            <Head title="Kelola Admin" />
            <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
                <header>
                    <h1 className="font-['Poppins'] text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
                        Kelola Admin
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Atur kredensial akun Admin Utama. Password login dan PIN pengaturan memiliki fungsi terpisah.
                    </p>
                </header>

                {flash.success && (
                    <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                        {flash.error}
                    </div>
                )}

                {!verified ? (
                    <ContainerWhite className="mx-auto max-w-xl">
                        <SectionHeader
                            icon={ShieldCheck}
                            title="Verifikasi PIN"
                            description="Masukkan PIN untuk membuka pengaturan sensitif akun Admin Utama."
                        />
                        <form onSubmit={submitPin} className="space-y-5">
                            <SecretField
                                id="manage_pin"
                                label="PIN Admin"
                                value={pinForm.data.pin}
                                onChange={(event) => pinForm.setData('pin', event.target.value)}
                                error={pinForm.errors.pin}
                                numeric
                            />
                            <p className="text-xs text-slate-500">PIN terdiri dari 8–12 digit angka.</p>
                            <PrimaryButton disabled={pinForm.processing}>
                                {pinForm.processing ? 'Memverifikasi...' : 'Buka Pengaturan'}
                            </PrimaryButton>
                        </form>
                    </ContainerWhite>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                        <ContainerWhite>
                            <SectionHeader
                                icon={Mail}
                                title="Ubah Email"
                                description="Email aktif digunakan untuk login dan pemulihan password."
                            />
                            <div className="mb-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email aktif saat ini</p>
                                <p className="mt-1 break-all font-medium text-slate-800">{email}</p>
                            </div>
                            {pendingEmail && (
                                <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Menunggu verifikasi untuk <strong>{pendingEmail}</strong>. Email aktif belum berubah.
                                </p>
                            )}
                            <form onSubmit={submitEmail} className="space-y-5">
                                <div>
                                    <InputLabel htmlFor="new_admin_email" value="Email Baru" />
                                    <TextInput
                                        id="new_admin_email"
                                        type="email"
                                        value={emailForm.data.email}
                                        onChange={(event) => emailForm.setData('email', event.target.value)}
                                        autoComplete="email"
                                        className="mt-1 block w-full"
                                        maxLength={100}
                                        required
                                    />
                                    <InputError message={emailForm.errors.email} className="mt-2" />
                                </div>
                                <p className="text-xs leading-relaxed text-slate-500">
                                    Kami akan mengirim tautan verifikasi ke alamat baru. Email login dan pemulihan hanya berubah setelah tautan dibuka.
                                </p>
                                <PrimaryButton disabled={emailForm.processing}>
                                    {emailForm.processing ? 'Mengirim...' : 'Kirim Verifikasi Email'}
                                </PrimaryButton>
                            </form>
                        </ContainerWhite>

                        <ContainerWhite>
                            <SectionHeader
                                icon={LockKeyhole}
                                title="Ubah Password Login"
                                description="Password ini tetap menjadi satu-satunya kredensial untuk login ke dashboard."
                            />
                            <form onSubmit={submitPassword} className="space-y-4">
                                <SecretField
                                    id="current_admin_password"
                                    label="Password Saat Ini"
                                    value={passwordForm.data.current_password}
                                    onChange={(event) => passwordForm.setData('current_password', event.target.value)}
                                    error={passwordForm.errors.current_password}
                                    autoComplete="current-password"
                                />
                                <SecretField
                                    id="new_admin_password"
                                    label="Password Baru"
                                    value={passwordForm.data.password}
                                    onChange={(event) => passwordForm.setData('password', event.target.value)}
                                    error={passwordForm.errors.password}
                                />
                                <SecretField
                                    id="confirm_admin_password"
                                    label="Konfirmasi Password Baru"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                    error={passwordForm.errors.password_confirmation}
                                />
                                <p className="text-xs text-slate-500">Minimal 8 karakter, dengan huruf dan angka.</p>
                                <PrimaryButton disabled={passwordForm.processing}>
                                    {passwordForm.processing ? 'Menyimpan...' : 'Simpan Password'}
                                </PrimaryButton>
                            </form>
                        </ContainerWhite>

                        <ContainerWhite className="lg:col-span-2">
                            <SectionHeader
                                icon={KeyRound}
                                title="Ubah PIN Pengaturan"
                                description="PIN hanya membuka halaman Kelola Admin dan tidak dapat digunakan untuk login."
                            />
                            <form onSubmit={submitPinChange} className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <SecretField
                                    id="current_admin_pin"
                                    label="PIN Saat Ini"
                                    value={changePinForm.data.current_pin}
                                    onChange={(event) => changePinForm.setData('current_pin', event.target.value)}
                                    error={changePinForm.errors.current_pin}
                                    numeric
                                />
                                <SecretField
                                    id="new_admin_pin"
                                    label="PIN Baru"
                                    value={changePinForm.data.pin}
                                    onChange={(event) => changePinForm.setData('pin', event.target.value)}
                                    error={changePinForm.errors.pin}
                                    numeric
                                />
                                <SecretField
                                    id="confirm_admin_pin"
                                    label="Konfirmasi PIN Baru"
                                    value={changePinForm.data.pin_confirmation}
                                    onChange={(event) => changePinForm.setData('pin_confirmation', event.target.value)}
                                    error={changePinForm.errors.pin_confirmation}
                                    numeric
                                />
                                <div className="md:col-span-3">
                                    <p className="mb-4 text-xs text-slate-500">PIN harus terdiri dari 8–12 digit angka. Setelah disimpan, Anda perlu memverifikasi lagi menggunakan PIN baru.</p>
                                    <PrimaryButton disabled={changePinForm.processing}>
                                        {changePinForm.processing ? 'Menyimpan...' : 'Simpan PIN'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </ContainerWhite>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
