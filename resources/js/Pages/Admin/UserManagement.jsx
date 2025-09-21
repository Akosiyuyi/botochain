import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import Table from '@/Components/Table';
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
                    <PrimaryButton>Create New Admin</PrimaryButton>
                    <SecondaryButton>Login Logs</SecondaryButton>
                </div>
            }
        >
            <Head title="Users" />

            <div className="">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <StatsBox stats={stats} />
                    <div className="mt-6">
                        <Table
                            rows={users}
                            header={[
                                { key: "id", label: "No.", sortable: true },
                                { key: "id_number", label: "ID Number", sortable: true },
                                { key: "name", label: "Name", sortable: true },
                                { key: "email", label: "Email", sortable: true },
                                { key: "role", label: "Role" },
                                { key: "status", label: "Status" },
                                { key: "action", label: "Action" },
                            ]}
                            optionList={["All", "Super-admin", "Admin", "Voter"]}
                            defaultOption="All"
                            onEdit={(user) => console.log("Edit user:", user)}
                            renderCell={(row, key, { onEdit }) => {
                                if (key === "role") {
                                    return row.roles.map((r) => r.name.charAt(0).toUpperCase() + r.name.slice(1)).join(", ");
                                }
                                if (key === "status") {
                                    return row.is_active ? (
                                        <span className="text-green-600">Active</span>
                                    ) : (
                                        <span className="text-red-500">Inactive</span>
                                    );
                                }
                                if (key === "action") {
                                    return (
                                        <button onClick={() => onEdit(row)} className="text-blue-600 hover:underline">
                                            Edit
                                        </button>
                                    );
                                }
                                return row[key];
                            }}
                            filterFn={(row, option, defaultOption) => {
                                if (option === defaultOption) return true;
                                return row.roles.some((r) => r.name.toLowerCase() === option.toLowerCase());
                            }}
                            getHeaderTitle={(option) => (option === "All" ? "All Users" : `${option} List`)}
                            getHeaderSubtitle={(option) => (option === "All" ? "Includes all registered users, voters and admins." : `List of all registered ${option.toLowerCase()}s only`)}
                            searchPlaceholder="Search users..."
                        />

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
