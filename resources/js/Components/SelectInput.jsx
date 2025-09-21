import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SelectInput({ id, value, onChange, options, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const ref = useRef(null);

    // Detect clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Get actual dropdown height instead of fixed 200px
            const dropdownEl = ref.current.querySelector("ul");
            const dropdownHeight = dropdownEl ? dropdownEl.scrollHeight : 200;

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [open, options]); // re-check also when options change

    return (
        <div ref={ref} className="relative inline-block text-sm">
            {/* Selected Value */}
            <button
                id={id}
                onClick={() => setOpen((prev) => !prev)}
                disabled={disabled}
                className={`border rounded-lg px-3 py-1.5 min-w-[120px] bg-white dark:bg-gray-900 dark:text-white disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed flex justify-between items-center hover:border-green-600
        ${open ? "border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600" : "dark:border-gray-600 border-gray-300"}`}
            >
                <span>{value}</span>
                {open ? (
                    <ChevronUp size={16} className="ml-2" />
                ) : (
                    <ChevronDown size={16} className="ml-2" />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <ul
                    className={`absolute z-50 border rounded-lg bg-white dark:bg-gray-900 dark:text-white dark:border-gray-600 shadow-lg max-h-52 overflow-auto w-full
                    ${openUpward ? "bottom-full mb-2" : "top-full mt-2"}`}
                >
                    {options.map((opt) => (
                        <li
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-800 ${value === opt ? "bg-green-200 dark:bg-green-700" : ""
                                }`}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
