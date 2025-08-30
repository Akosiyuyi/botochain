import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react"; // install lucide-react if not yet
import SelectInput from "./SelectInput";

export default function UsersTable({ users = [] }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [roleFilter, setRoleFilter] = useState("All");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    // 🔹 Handle Sorting
    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                // toggle direction
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
        setPage(1);
    };

    // 🔍 Search + Role Filter
    let filtered = users.filter((u) => {
        const matchesSearch = Object.values(u).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
        );

        const matchesRole =
            roleFilter === "All"
                ? true
                : u.roles.some(
                    (r) => r.name.toLowerCase() === roleFilter.toLowerCase()
                );

        return matchesSearch && matchesRole;
    });


    // 🔹 Apply Sorting
    if (sortConfig.key) {
        filtered = [...filtered].sort((a, b) => {
            const valA = a[sortConfig.key] ?? "";
            const valB = b[sortConfig.key] ?? "";

            if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
            if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }

    // 📑 Pagination
    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    const start = (page - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);

    const headerTitle =
        roleFilter === "All"
            ? "All Users"
            : roleFilter === "Voter"
                ? "Voter List"
                : "Admin";

    const headerSubtitle =
        roleFilter === "All"
            ? "Includes all registered users, voters and admins."
            : roleFilter === "Voter"
                ? "List of all voters."
                : "List of all admins.";

    // 🔹 Utility to show chevron
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <ChevronUp className="w-4 h-4 opacity-30" />;
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4" />
        ) : (
            <ChevronDown className="w-4 h-4" />
        );
    };

    // handle editing rows
    const handleEdit = () => {

    }

    return (
        <div className="rounded-lg overflow-hidden">
            {/* 🔹 Header */}
            <div className="p-4 bg-white dark:bg-gray-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="font-semibold text-lg dark:text-white">{headerTitle}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {headerSubtitle}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {/* Role Filter */}
                    <SelectInput
                        id="status-filter"
                        value={roleFilter}
                        onChange={(val) => {
                            setRoleFilter(val);
                            setPage(1);
                        }}
                        options={["All", "Voter", "Admin"]}
                    />

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <input
                            id="student-search"
                            name="search"
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search users..."
                            className="w-full rounded-lg border dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-green-600"
                        />
                    </div>
                </div>
            </div>

            {/* 🔹 Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100">
                        <tr>
                            {[
                                { key: "id", label: "No.", sortable: true },
                                { key: "id_number", label: "ID Number", sortable: true },
                                { key: "name", label: "Full Name", sortable: true },
                                { key: "email", label: "Email Address" },
                                { key: "role", label: "Role" },
                                { key: "status", label: "Status" },
                                { key: "action", label: "Action" },
                            ].map((col) => (
                                <th
                                    key={col.key}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                    className={`px-4 py-2 font-bold ${col.sortable ? "cursor-pointer" : ""}`}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && renderSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {paginated.map((user, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2">{user.id}</td>
                                <td className="px-4 py-2">{user.id_number}</td>
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.roles.map(r => r.name.charAt(0).toUpperCase() + r.name.slice(1)).join(', ')}</td>
                                <td className="px-4 py-2">
                                    {user.is_active ? (
                                        <span className="text-green-600">Active</span>
                                    ) : (
                                        <span className="text-red-500">Inactive</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(student)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🔹 Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 text-sm bg-white dark:bg-gray-800 border-t dark:border-gray-600">
                <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="rows-per-page"
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Rows per page:
                        </label>
                        <SelectInput
                            id="rows-per-page"
                            value={rowsPerPage}
                            onChange={(val) => setRowsPerPage(val)}
                            options={[10, 25, 50, 100]}
                        />
                    </div>
                </div>

                <div className="space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-white dark:text-white dark:bg-gray-900 border disabled:opacity-50 enabled:hover:border-green-600"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-white dark:text-white dark:bg-gray-900 border disabled:opacity-50 enabled:hover:border-green-600"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
