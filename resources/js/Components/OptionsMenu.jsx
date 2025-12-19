import { Link } from "@inertiajs/react";
import { useEffect } from "react";
import React from "react";

export default function OptionsMenu({ menuId, setShowMenu, menuRef, options }) {


    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            id={menuId}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 dark:bg-gray-700"
        >
            {options.map((option, idx) => (
                <Link key={idx} href={option.route}
                    className={`block px-4 py-2 text-sm rounded-lg text-${option.color}-700 dark:text-${option.color}-300 hover:bg-gray-100 dark:hover:bg-gray-600`}
                >
                    <div className="flex items-center justify-start gap-4">
                        {/* Force all icons to the same size */}
                        <span className="flex-shrink-0">
                            {option.icon && React.cloneElement(option.icon, { size: 16 })}
                        </span>
                        <span>{option.name}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

