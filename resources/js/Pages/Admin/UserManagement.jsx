import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import UsersTable from '@/Components/UsersTable';
import StatsBox from '@/Components/StatsBox';
import SecondaryButton from '@/Components/SecondaryButton';

export default function UserManagement({ users, stats }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Users
                </h2>
            }
            button={
                <div className="flex gap-4">
                    <PrimaryButton>Add User</PrimaryButton>
                    <SecondaryButton>Login Logs</SecondaryButton>
                </div>
            }
        >
            <Head title="Users" />

            <div className="">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <StatsBox stats={stats} />
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mt-6">
                        <UsersTable users={users} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
