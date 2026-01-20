import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, LogIn, CheckCircle2, XCircle, Shield } from 'lucide-react';

export default function LoginLogs({ login_logs }) {
    return (
        <>
            <Head title="Login Logs" />

            <div className="mx-auto max-w-7xl">
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
                    renderCell={(row, key) => {
                        if (key === "status") {
                            return row.status ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                    <CheckCircle2 
                                        className="w-3.5 h-3.5"
                                        style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                    />
                                    Successful
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                    <XCircle 
                                        className="w-3.5 h-3.5"
                                        style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                    />
                                    Failed
                                </span>
                            );
                        }

                        if (key === "reason") {
                            return row[key] ? (
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {row[key]}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                                    —
                                </span>
                            );
                        }

                        if (key === "ip_address") {
                            return (
                                <code className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 rounded">
                                    {row[key]}
                                </code>
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
                    getHeaderSubtitle={(option) => (
                        option === "All" 
                            ? "Monitor all authentication attempts across the system" 
                            : `Showing ${option.toLowerCase()} login attempts only`
                    )}
                    searchPlaceholder="Search by email, IP, device..."
                />
            </div>
        </>
    );
}

LoginLogs.layout = (page) => {
    const header = (
        <div className="flex items-center gap-4">
            <Link 
                href={route("admin.users.index")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Login Logs
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Security audit trail for authentication events
                    </p>
                </div>
            </div>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};