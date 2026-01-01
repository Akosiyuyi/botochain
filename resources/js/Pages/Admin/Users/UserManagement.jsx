import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';
import Table from '@/Components/Table';
import StatsBox from '@/Components/StatsBox';
import SecondaryButton from '@/Components/SecondaryButton';
import { ModalLink } from '@inertiaui/modal-react';

export default function UserManagement({ users, stats, auth }) {
    const permissions = auth?.user?.permissions || [];
    const canCreateAdmin = permissions.includes('create_admin');

    return (
        <>
            <Head title="Users" />

            <div>
                <div className="mx-auto max-w-7xl">
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
                                canCreateAdmin && ({ key: "action", label: "Action" }),
                            ].filter(Boolean)}
                            optionList={["All", "Super-admin", "Admin", "Voter"]}
                            defaultOption="All"
                            onEdit={(user) => console.log("Edit user:", user)}
                            renderCell={(row, key) => {
                                if (key === "role") {
                                    return row.roles
                                        .map((r) => r.name.charAt(0).toUpperCase() + r.name.slice(1))
                                        .join(", ");
                                }

                                if (key === "status") {
                                    return row.is_active ? (
                                        <span className="text-green-600">Active</span>
                                    ) : (
                                        <span className="text-red-500">Inactive</span>
                                    );
                                }

                                if (key === "action" && canCreateAdmin) {
                                    // 👇 Check if the row has a Super-admin role
                                    const isSuperAdmin = row.roles.some(
                                        (r) => r.name.toLowerCase() === "super-admin"
                                    );

                                    if (!isSuperAdmin) {
                                        return (
                                            <ModalLink href={route("admin.users.edit", row.id)} // 👈 route to edit 
                                                closeButton={false}
                                                panelClasses="bg-white dark:bg-gray-800 rounded-lg" >
                                                <button className="text-blue-600 hover:underline"> Edit </button>
                                            </ModalLink>
                                        );
                                    }
                                    // If Super-admin, render nothing (or you could render a disabled button)
                                    return null;
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
        </>
    );
}

UserManagement.layout = (page) => {
    const user = page.props.auth.user;
    const permissions = user?.permissions || [];
    const canCreateAdmin = permissions.includes('create_admin');

    const header = (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
            Users
        </h2>
    );

    const button = (
        <div className="flex gap-4">
            {canCreateAdmin && (
                <ModalLink
                    href={route("admin.users.create")}
                    closeButton={false}
                    panelClasses="bg-white dark:bg-gray-800 rounded-lg"
                >
                    <PrimaryButton>Create Admin</PrimaryButton>
                </ModalLink>
            )}

            <Link href={route("admin.login_logs")}>
                <SecondaryButton>Login Logs</SecondaryButton>
            </Link>
        </div>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};
