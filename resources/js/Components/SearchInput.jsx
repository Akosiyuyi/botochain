export default function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    className = "",
    id = "search-input",
    name = "search",
}) {
    return (
        <div className="relative w-full sm:w-64">
            <input
                id={id}
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full rounded-lg border dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-600 ${className}`}
            />
        </div>
    );
}
