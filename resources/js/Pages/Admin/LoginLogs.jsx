import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

export default function LoginLogs({ login_logs }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex gap-4">
                    <Link href={route("admin.users.index")}>
                        <ChevronLeft className='text-gray-800 dark:text-white scale-90 hover:scale-110' />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                        Login Logs
                    </h2>
                </div>

            }
        >
            <Head title="Login Logs" />

            <div className="">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mt-6">
                        <Table
                            rows={login_logs}
                            header={[
                                { key: "date", label: "Date", sortable: true },
                                { key: "time", label: "Time", sortable: true },
                                { key: "email", label: "Email Address" },
                                { key: "ip_address", label: "IP Address" },
                                { key: "device", label: "Device" },
                                { key: "platform", label: "Platform" },
                                { key: "browser", label: "Browser" },
                                { key: "status", label: "Status" },
                                { key: "reason", label: "Reason" },
                            ]}
                            optionList={["All", "Successful", "Failed"]}
                            defaultOption="All"
                            renderCell={(row, key, { onEdit }) => {
                                if (key === "status") {
                                    return row.status ? (
                                        <span className="text-green-600">Successful</span>
                                    ) : (
                                        <span className="text-red-500">Failed</span>
                                    );
                                }
                                return row[key];
                            }}
                            filterFn={(row, option, defaultOption) => {
                                if (option === defaultOption) return true;
                                if (option === "Successful") return row.status === 1;
                                if (option === "Failed") return row.status === 0;
                                return true;
                            }}
                            getHeaderTitle={(option) => (option === "All" ? "All Login Attempts" : `${option} Attempts`)}
                            getHeaderSubtitle={(option) => (option === "All" ? "Here is the list of all login attempts" : `List of all ${option.toLowerCase()} attempts`)}
                            searchPlaceholder="Search attempt..."
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}