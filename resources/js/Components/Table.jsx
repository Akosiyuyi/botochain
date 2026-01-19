import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
    const totalResults = filtered.length;

    // 🧠 Dynamic Header
    const headerTitle = getHeaderTitle ? getHeaderTitle(option) : "Table List";
    const headerSubtitle = getHeaderSubtitle ? getHeaderSubtitle(option) : "";

    // 🔹 Utility to show chevron
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <ChevronUp className="w-4 h-4 opacity-20" />;
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4 opacity-100" />
        ) : (
            <ChevronDown className="w-4 h-4 opacity-100" />
        );
    };

    const safeRender = (value) =>
        value !== null && value !== undefined && value !== "" ? value : "-";

    return (
        <div className="space-y-4">
            {/* 🔹 Header with Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                <div className="flex flex-col gap-4">
                    {/* Title Section */}
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                            {headerTitle}
                        </h3>
                        {headerSubtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {headerSubtitle}
                            </p>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
                            <SelectInput
                                id="role-filter"
                                value={option}
                                onChange={(val) => {
                                    setOption(val);
                                    setPage(1);
                                }}
                                options={optionList}
                            />
                        </div>

                        <SearchInput
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder={searchPlaceholder}
                        />
                    </div>

                    {/* Results Count */}
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Showing <span className="text-gray-900 dark:text-white font-semibold">{paginated.length}</span> of{" "}
                        <span className="text-gray-900 dark:text-white font-semibold">{totalResults}</span> results
                    </div>
                </div>
            </div>

            {/* 🔹 Table Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                {header.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                        className={`px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-900 dark:text-gray-100 ${
                                            col.sortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 select-none">
                                            <span>{col.label}</span>
                                            {col.sortable && renderSortIcon(col.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginated.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                                >
                                    {header.map((col) => (
                                        <td key={col.key} className="px-4 md:px-6 py-3 md:py-4 text-sm">
                                            {safeRender(
                                                renderCell ? renderCell(row, col.key, { onEdit }) : row[col.key]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {paginated.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={header.length}
                                        className="px-4 md:px-6 py-8 md:py-12 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-30" />
                                            <span className="font-medium">No records found</span>
                                            <span className="text-xs">Try adjusting your search or filter criteria</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 Footer - Pagination */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 md:py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Left: Rows per page */}
                    <div className="flex items-center gap-3 text-sm">
                        <label htmlFor="rows-per-page" className="text-gray-600 dark:text-gray-400 font-medium">
                            Per page:
                        </label>
                        <SelectInput
                            id="rows-per-page"
                            value={rowsPerPage}
                            onChange={(val) => {
                                setRowsPerPage(val);
                                setPage(1);
                            }}
                            options={[10, 25, 50, 100]}
                            disabled={rows.length < 10}
                        />
                    </div>

                    {/* Center: Page Info */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Page <span className="text-gray-900 dark:text-white font-semibold">{page}</span> of{" "}
                        <span className="text-gray-900 dark:text-white font-semibold">{totalPages}</span>
                    </div>

                    {/* Right: Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-150 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Prev</span>
                        </button>

                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-150 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
