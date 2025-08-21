import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from "@inertiajs/react";

export default function Dashboard() {
    const user = usePage().props.auth.user;
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Welcome back, <span className='text-green-700'>{user.name}</span>
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            Admin!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
