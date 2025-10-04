import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            Voter!
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => {
    const user = page.props.auth.user;

    const header = (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
            Welcome back, <span className="text-green-700">{user.name}</span>
        </h2>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};
