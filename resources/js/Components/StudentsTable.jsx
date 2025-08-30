import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react"; // install lucide-react if not yet
import SelectInput from "./SelectInput";

export default function StudentsTable({ students }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
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

    // 🔍 Search + Status Filter
    let filtered = students.filter((s) => {
        const matchesSearch = Object.values(s).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
        );

        const matchesStatus =
            statusFilter === "All"
                ? true
                : statusFilter === "Active"
                    ? !s.is_graduated
                    : s.is_graduated;

        return matchesSearch && matchesStatus;
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
        statusFilter === "All"
            ? "All Students (Current & Former)"
            : statusFilter === "Active"
                ? "Enrolled Students This School Year"
                : "Inactive Students (Graduated or Not Enrolled)";

    const headerSubtitle =
        statusFilter === "All"
            ? "Includes all registered students, both currently enrolled and previously enrolled."
            : statusFilter === "Active"
                ? "List of students actively enrolled for the current school year."
                : "List of students who have graduated or did not enroll this year.";

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
                    {/* Status Filter */}
                    <SelectInput
                    id="status-filter"
                        value={statusFilter}
                        onChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                        }}
                        options={["All", "Active", "Inactive"]}
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
                            placeholder="Search students..."
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
                                { key: "student_id", label: "Student ID", sortable: true },
                                { key: "full_name", label: "Full Name", sortable: true },
                                { key: "school_level", label: "School Level" },
                                { key: "grade_year", label: "Grade/Year" },
                                { key: "course", label: "Course" },
                                { key: "section", label: "Section" },
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
                        {paginated.map((student, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                                    No students found.
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
                        id= "rows-per-page"
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
