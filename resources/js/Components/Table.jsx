import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import SelectInput from "./SelectInput";
import SearchInput from "./SearchInput";

export default function Table({
    rows = [],
    header = [],
    optionList = ["All"],
    defaultOption = "All",
    rowsPerPageDefault = 10,
    renderCell,
    onEdit,
    filterFn,
    getHeaderTitle,
    getHeaderSubtitle,
    searchPlaceholder = "Search...",
}) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageDefault);
    const [option, setOption] = useState(defaultOption);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    // 🔹 Handle Sorting
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
        setPage(1);
    };

    // 🔍 Search + Option Filter
    let filtered = rows.filter((row) => {
        const matchesSearch = Object.values(row).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
        );

        const matchesOption =
            filterFn?.(row, option, defaultOption) ??
            (option === defaultOption ? true : false);

        return matchesSearch && matchesOption;
    });

    // 🔹 Apply Sorting
    if (sortConfig.key) {
        filtered.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];

            if (typeof valA === "number" && typeof valB === "number") {
                return sortConfig.direction === "asc" ? valA - valB : valB - valA;
            }

            return String(valA).localeCompare(String(valB)) * (sortConfig.direction === "asc" ? 1 : -1);
        });
    }

    // 📑 Pagination
    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    const start = (page - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);

    // 🧠 Dynamic Header
    const headerTitle = getHeaderTitle ? getHeaderTitle(option) : "Table List";
    const headerSubtitle = getHeaderSubtitle ? getHeaderSubtitle(option) : "";

    // 🔹 Utility to show chevron
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <ChevronUp className="w-4 h-4 opacity-30" />;
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4" />
        ) : (
            <ChevronDown className="w-4 h-4" />
        );
    };

    const safeRender = (value) =>
        value !== null && value !== undefined && value !== "" ? value : "-";

    return (
        <div className="rounded-lg overflow-hidden">
            {/* 🔹 Header */}
            <div className="p-4 bg-white dark:bg-gray-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="font-semibold text-lg dark:text-white">{headerTitle}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{headerSubtitle}</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <SelectInput
                        id="role-filter"
                        value={option}
                        onChange={(val) => {
                            setOption(val);
                            setPage(1);
                        }}
                        options={optionList}
                    />

                    <SearchInput
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder={searchPlaceholder}
                    />
                </div>
            </div>

            {/* 🔹 Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100">
                        <tr>
                            {header.map((col) => (
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

                    <tbody className="bg-white dark:bg-gray-800">
                        {paginated.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                {header.map((col) => (
                                    <td key={col.key} className="px-4 py-2">
                                        {safeRender(renderCell ? renderCell(row, col.key, { onEdit }) : row[col.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={header.length} className="px-4 py-6 text-center text-gray-500">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🔹 Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 text-sm bg-white dark:bg-gray-800 border-t dark:border-gray-600">
                <div className="flex items-center gap-3">
                    <span className="dark:text-white">Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                        <label htmlFor="rows-per-page" className="text-gray-600 dark:text-gray-400">
                            Rows per page:
                        </label>
                        <SelectInput
                            id="rows-per-page"
                            value={rowsPerPage}
                            onChange={(val) => setRowsPerPage(val)}
                            options={[10, 25, 50, 100]}
                            disabled={rows.length < 10}
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
