import { useState } from "react";

export default function StudentsTable({ students }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

    // 🔍 Search + Status Filter
    const filtered = students.filter((s) => {
        const matchesSearch = Object.values(s).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
        );

        const matchesStatus =
            statusFilter === "all"
                ? true
                : statusFilter === "active"
                    ? !s.is_graduated
                    : s.is_graduated;

        return matchesSearch && matchesStatus;
    });

    // 📑 Pagination
    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    const start = (page - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);

    return (
        <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
            {/* 🔹 Header */}
            <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="font-semibold text-lg">Students List</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Complete list of students for this school year.
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {/* Status Filter */}
                    <select
                        id="status-filter"
                        name="statusFilter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="border rounded-lg px-3 py-1.5 min-w-[120px] text-sm bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <input
                            id="student-search"
                            name="search"
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // reset to first page after search
                            }}
                            placeholder="Search students..."
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                </div>
            </div>

            {/* 🔹 Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <tr>
                            <th className="px-4 py-2 font-bold">Student ID</th>
                            <th className="px-4 py-2 font-bold">Full Name</th>
                            <th className="px-4 py-2 font-bold">School Level</th>
                            <th className="px-4 py-2 font-bold">Grade/Year</th>
                            <th className="px-4 py-2 font-bold">Course</th>
                            <th className="px-4 py-2 font-bold">Section</th>
                            <th className="px-4 py-2 font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((student, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-4 py-2">{student.student_id}</td>
                                <td className="px-4 py-2">{student.full_name}</td>
                                <td className="px-4 py-2 capitalize">{student.school_level}</td>
                                <td className="px-4 py-2">{student.grade_year}</td>
                                <td className="px-4 py-2">{student.course || "-"}</td>
                                <td className="px-4 py-2">{student.section}</td>
                                <td className="px-4 py-2">
                                    {student.is_graduated ? (
                                        <span className="text-red-500">Inactive</span>
                                    ) : (
                                        <span className="text-green-600">Active</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🔹 Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 text-sm bg-gray-100 dark:bg-gray-800">
                {/* Page info + Rows per page */}
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
                        <select
                            id="rows-per-page"
                            name="rowsPerPage"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(1); // reset to first page after changing rows
                            }}
                            className="border rounded-lg px-3 py-1.5 min-w-[90px] text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
                        >
                            {[5, 10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pagination controls */}
                <div className="space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-white dark:bg-gray-900 border disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-white dark:bg-gray-900 border disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
