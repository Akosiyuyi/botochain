import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default forwardRef(function SelectInputForForms(
    { id, value, onChange, options = [], disabled = false, className = "", isFocused = false, ...props },
    ref
) {
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const localRef = useRef(null);

    // Expose focus() to parent
    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    // Auto-focus if isFocused
    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (localRef.current && !localRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Decide whether to open upward or downward
    useEffect(() => {
        if (open && localRef.current) {
            const rect = localRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            const dropdownEl = localRef.current.querySelector("ul");
            const dropdownHeight = dropdownEl ? dropdownEl.scrollHeight : 200;

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [open, options]);

    return (
        <div ref={localRef} className={`relative inline-block text-sm w-full ${className}`}>
            {/* Selected Value */}
            <button
                id={id || "select-input"}
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                disabled={disabled}
                className={`border rounded-md px-3 py-2 w-full bg-white dark:bg-gray-900 dark:text-white flex justify-between items-center
                    disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed
                    ${open ? "border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600" : "border-gray-300 dark:border-gray-600"}
                `}
                {...props}
            >
                <span>
                    {options.find(opt => opt.value === value)?.label || "Choose an option"}
                </span>

                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Dropdown */}
            {open && (
                <ul
                    className={`absolute z-50 border rounded-md bg-white dark:bg-gray-900 dark:text-white dark:border-gray-600 shadow-lg max-h-52 overflow-auto w-full
                        ${openUpward ? "bottom-full mb-2" : "top-full mt-2"}
                    `}
                >
                    {options.map((opt) => (
                        <li
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-800 ${value === opt.value ? "bg-green-200 dark:bg-green-700" : ""
                                }`}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});
