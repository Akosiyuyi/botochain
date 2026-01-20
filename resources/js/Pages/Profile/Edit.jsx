import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import RecentLoginActivity from './Partials/RecentLoginActivity';
import { User, Mail, Shield, IdCard } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status, recentLogins }) {
    return (
        <>
            <Head title="Profile" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <RecentLoginActivity 
                        recentLogins={recentLogins}
                        className="max-w-full"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </>
    );
}

Edit.layout = (page) => {
    const user = page.props.auth.user;
    const role = user.roles[0]?.name || 'voter';
    
    const roleColors = {
        "super-admin": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        "admin": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        "voter": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    };

    const header = (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-white dark:border-gray-800" />
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            {user.name}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        {/* Role Badge */}
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="font-medium">Role</span>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                roleColors[role] || "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                            }`}>
                                {role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                        </div>

                        {/* ID Number */}
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                <IdCard className="w-3.5 h-3.5" />
                                <span className="font-medium">ID Number</span>
                            </div>
                            <code className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-md text-sm font-mono text-gray-700 dark:text-gray-300">
                                {user.id_number}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};
