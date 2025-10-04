import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <>
            <Head title="Profile" />

            <div className="">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page) => {
    const user = page.props.auth.user;
    const role = user.roles[0];
    const roleColors = {
        "admin": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "super-admin": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "voter": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
    const header = (
        <div className="flex gap-6 mb-4">
            <div className="relative inline-flex items-center justify-center h-14 w-14 overflow-hidden bg-green-600 rounded-full">
                <span className="font-extrabold text-3xl text-white">{user.name.charAt(0)}</span>
            </div>
            <div className= "dark:text-white">
                <h1 className='text-xl font-semibold'>{user.name}</h1>
                <h1 className='text-md'>{user.email}</h1>
                <div className="mt-2 flex gap-12">
                    <div>
                        <h1 className="text-sm font-light text-gray-500">Role</h1>
                        <div
                            className={`text-xs font-medium mt-1 py-1.5 px-4 rounded-full ${roleColors[role] || "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {role}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-sm font-light text-gray-500">ID</h1>
                        <h1 className="text-sm font-light mt-2">{user.id_number}</h1>
                    </div>

                </div>
            </div>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
}
