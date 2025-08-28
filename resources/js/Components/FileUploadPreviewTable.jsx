import { useState } from "react";

const variantStyles = {
    new: {
        header: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        border: "border-blue-300 dark:border-blue-700",
    },
    existing: {
        header: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        border: "border-green-300 dark:border-green-700",
    },
    incomplete: {
        header: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        border: "border-yellow-300 dark:border-yellow-700",
    },
    missing: {
        header: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
        border: "border-red-300 dark:border-red-700",
    },
};

export default function FileUploadPreviewTable({ students, variant = "new" }) {
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const totalPages = Math.ceil(students.length / rowsPerPage);
    const start = (page - 1) * rowsPerPage;
    const paginated = students.slice(start, start + rowsPerPage);

    const styles = variantStyles[variant] || variantStyles.new;

    const getTitle = (variant) => {
        switch (variant) {
            case "new":
                return "New Students";
            case "existing":
                return "Existing Students";
            case "incomplete":
                return "Incomplete Data";
            case "missing":
                return "Missing Students";
            default:
                return "Students List";
        }
    };

    const getSubtitle = (variant) => {
        switch (variant) {
            case "new":
                return "Students who have newly enrolled for this school year.";
            case "existing":
                return "Returning students who re-enrolled for this school year.";
            case "incomplete":
                return "Students with incomplete enrollment or profile details.";
            case "missing":
                return "Students from last year who have not enrolled this year.";
            default:
                return "Complete list of students for this school year.";
        }
    };


    return (
        <div
            className={`mt-6 rounded-xl overflow-hidden border ${styles.border}`}
        >
            {/* Header */}
            <div className={`px-4 py-3 ${styles.header}`}>
                <div className="font-semibold text-lg">
                    {getTitle(variant)}
                </div>
                <div className="text-sm">
                    {getSubtitle?.(variant) ?? "None"}
                </div>
            </div>

            {/* Table wrapper with horizontal scroll */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <tr>
                            <th className="px-4 py-2 font-bold">Student ID</th>
                            <th className="px-4 py-2 font-bold">Full Name</th>
                            <th className="px-4 py-2 font-bold">School Level</th>
                            <th className="px-4 py-2 font-bold">Grade/Year</th>
                            <th className="px-4 py-2 font-bold">Course</th>
                            <th className="px-4 py-2 font-bold">Section</th>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer (Pagination) */}
            <div
                className={`flex justify-between items-center px-4 py-3 text-sm ${styles.header}`}
            >
                <div>
                    Page {page} of {totalPages}
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-white dark:bg-gray-800 border disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-white dark:bg-gray-800 border disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
