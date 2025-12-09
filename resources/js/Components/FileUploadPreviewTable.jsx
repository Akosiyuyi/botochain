import { useState } from "react";
import { CircleCheck, CircleMinus, CircleAlert } from "lucide-react";

const variantStyles = {
    validated: {
        header: "bg-green-300 dark:bg-green-900 text-green-800 dark:text-green-200",
        border: "border-2 border-green-400 dark:border-green-700",
        table_bg: "bg-green-50 dark:bg-green-900/30",
        table_header_bg: "bg-green-100 dark:bg-green-900/40",
    },
    incomplete: {
        header: "bg-yellow-300 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        border: "border-2 border-yellow-400 dark:border-yellow-700",
        table_bg: "bg-yellow-50 dark:bg-yellow-900/30",
        table_header_bg: "bg-yellow-100 dark:bg-yellow-900/40",
    },
    error: {
        header: "bg-red-300 dark:bg-red-900 text-red-800 dark:text-red-200",
        border: "border-2 border-red-400 dark:border-red-700",
        table_bg: "bg-red-50 dark:bg-red-900/30",
        table_header_bg: "bg-red-100 dark:bg-red-900/40",
    },
};

export default function FileUploadPreviewTable({ students, variant }) {
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const totalPages = Math.ceil(students.length / rowsPerPage);
    const start = (page - 1) * rowsPerPage;
    const paginated = students.slice(start, start + rowsPerPage);

    const styles = variantStyles[variant] || variantStyles.new;

    const getIcon = (variant) => {
        switch (variant) {
            case "validated":
                return <CircleCheck className="text-green-800 dark:text-green-200 w-7 h-7" />;
            case "incomplete":
                return <CircleMinus className="text-yellow-800 dark:text-yellow-200 w-7 h-7" />;
            case "error":
                return <CircleAlert className="text-red-800 dark:text-red-200 w-7 h-7" />;
            default:
                return null; // or a fallback icon
        }
    };

    const getTitle = (variant) => {
        switch (variant) {
            case "validated":
                return "Validated Rows";
            case "incomplete":
                return "Incomplete Data";
            case "error":
                return "Error Rows";
            default:
                return "N/A";
        }
    };

    const getSubtitle = (variant) => {
        switch (variant) {
            case "validated":
                return "Rows with complete and correct data.";
            case "incomplete":
                return "Rows with missing required data.";
            case "error":
                return "Rows with wrong data.";
            default:
                return "N/A";
        }
    };


    return (
        <div
            className={`mt-6 rounded-xl overflow-hidden border ${styles.border}`}
        >
            {/* Header */}
            <div className={`flex items-center gap-4 px-4 py-3 ${styles.header}`}>
                {getIcon(variant)}
                <div className="font-semibold text-lg">
                    {getTitle(variant)} ({students.length})
                    <div className="text-sm">
                        {getSubtitle?.(variant) ?? "None"}
                    </div>
                </div>
            </div>

            {/* Table wrapper with horizontal scroll */}
            <div className="overflow-x-auto">
                <table className={`min-w-full ${styles.table_bg} dark:bg-gray-800 text-sm text-left text-gray-700 dark:text-gray-300`}>
                    <thead className={`${styles.table_header_bg} dark:bg-gray-700 text-gray-900 dark:text-gray-100`}>
                        <tr>
                            <th className="px-4 py-2 font-extrabold">Student ID</th>
                            <th className="px-4 py-2 font-extrabold">Full Name</th>
                            <th className="px-4 py-2 font-extrabold">School Level</th>
                            <th className="px-4 py-2 font-extrabold">Year Level</th>
                            <th className="px-4 py-2 font-extrabold">Course</th>
                            <th className="px-4 py-2 font-extrabold">Section</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((student, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2">{student.student_id}</td>
                                <td className="px-4 py-2">{student.name}</td>
                                <td className="px-4 py-2 capitalize">{student.school_level}</td>
                                <td className="px-4 py-2">{student.year_level}</td>
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
