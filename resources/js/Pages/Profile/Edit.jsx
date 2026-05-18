import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, Trash2 } from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <SiswaLayout
            user={auth.user}
            header="Profil Saya"
        >
            <Head title="Profil Saya" />

            <div className="max-w-4xl space-y-6">
                <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm sm:rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <User size={100} />
                    </div>
                    <div className="relative z-10">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm sm:rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-[#1b5e20]">
                        <Shield size={100} />
                    </div>
                    <div className="relative z-10">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>

                <div className="bg-red-50/50 p-6 md:p-8 border border-red-100 shadow-sm sm:rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-red-600">
                        <Trash2 size={100} />
                    </div>
                    <div className="relative z-10">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </SiswaLayout>
    );
}
