import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';
import Table from '@/Components/Table';
import StatsBox from '@/Components/StatsBox';
import SecondaryButton from '@/Components/SecondaryButton';
import { ModalLink } from '@inertiaui/modal-react';
import { Users, UserPlus, LogIn, Settings2, Shield, CheckCircle2, Ban, Vote } from 'lucide-react';

export default function UserManagement({ users, stats, auth }) {
    const permissions = auth?.user?.permissions || [];
    const canCreateAdmin = permissions.includes('create_admin');

    // Transform stats array into StatsBox format with icons
    const statsData = (Array.isArray(stats) ? stats : []).map((s) => {
        const title = String(s.title || '').toLowerCase();
        let icon = Users;
        let color = 'indigo';

        if (title.includes('all users')) { icon = Users; color = 'blue'; }
        else if (title.includes('voters')) { icon = Vote; color = 'green'; }
        else if (title.includes('admins')) { icon = Shield; color = 'purple'; }
        else if (title.includes('deactivated')) { icon = Ban; color = 'red'; }

        return {
            title: s.title,
            value: s.value,
            icon,
            color,
        };
    });

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6">
                <div className="mx-auto max-w-7xl gap-4 flex flex-col">
                    {/* Stats Box with Icons */}
                    <StatsBox stats={statsData} showIcons={true} />

                    {/* Table */}
                    <Table
                        rows={users}
                        header={[
                            { key: "id", label: "No.", sortable: true },
                            { key: "id_number", label: "ID Number", sortable: true },
                            { key: "name", label: "Name", sortable: true },
                            { key: "email", label: "Email", sortable: true },
                            { key: "role", label: "Role" },
                            { key: "status", label: "Status" },
                            canCreateAdmin && { key: "action", label: "Action" },
                        ].filter(Boolean)}
                        optionList={["All", "Super-admin", "Admin", "Voter"]}
                        defaultOption="All"
                        onEdit={(user) => console.log("Edit user:", user)}
                        renderCell={(row, key) => {
                            if (key === "role") {
                                return (
                                    <div className="flex flex-wrap gap-2">
                                        {row.roles.map((r) => (
                                            <span
                                                key={r.id}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${r.name.toLowerCase() === 'super-admin'
                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                        : r.name.toLowerCase() === 'admin'
                                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                    }`}
                                            >
                                                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                );
                            }

                            if (key === "status") {
                                return (
                                    <div className="flex items-center gap-2">
                                        {row.is_active ? (
                                            <>
                                                <CheckCircle2
                                                    className="w-4 h-4 block text-green-600 dark:text-green-400"
                                                    style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                                />
                                                <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <Ban
                                                    className="w-4 h-4 block text-red-600 dark:text-red-400"
                                                    style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                                />
                                                <span className="text-red-600 dark:text-red-400 font-medium">Inactive</span>
                                            </>
                                        )}
                                    </div>
                                );
                            }

                            if (key === "action" && canCreateAdmin) {
                                const isSuperAdmin = row.roles.some(
                                    (r) => r.name.toLowerCase() === "super-admin"
                                );

                                if (!isSuperAdmin) {
                                    return (
                                        <ModalLink
                                            href={route("admin.users.edit", row.id)}
                                            closeButton={false}
                                            panelClasses="bg-white dark:bg-gray-800 rounded-lg"
                                        >
                                            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                <Settings2
                                                    className="w-4 h-4 block"
                                                    style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                                />
                                                <span className="text-sm font-medium">Edit</span>
                                            </button>
                                        </ModalLink>
                                    );
                                }
                                return (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        Cannot edit
                                    </span>
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
                        searchPlaceholder="Search by name, email, or ID..."
                    />
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
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                User Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all system users, admins, and permissions
            </p>
        </div>
    );

    const button = (
        <>
            {canCreateAdmin && (
                <ModalLink
                    href={route("admin.users.create")}
                    closeButton={false}
                    panelClasses="bg-white dark:bg-gray-800 rounded-lg"
                >
                    <PrimaryButton className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                        <UserPlus className="w-4 h-4" />
                        Add Admin
                    </PrimaryButton>
                </ModalLink>
            )}

            <Link href={route("admin.login_logs")}>
                <SecondaryButton className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                    <LogIn className="w-4 h-4" />
                    Login Logs
                </SecondaryButton>
            </Link>
        </>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};
