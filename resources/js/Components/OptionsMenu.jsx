import { Link } from "@inertiajs/react";
import { useEffect } from "react";
import React from "react";
import { ModalLink } from '@inertiaui/modal-react';

export default function OptionsMenu({ menuId, setShowMenu, menuRef, options }) {
    const renderContent = (option) => (
        <div className="flex items-center justify-start gap-4">
            <span className="flex-shrink-0">
                {option.icon && React.cloneElement(option.icon, { size: 16 })}
            </span>
            <span>{option.name}</span>
        </div>
    );

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
            {options.map((option, idx) => {
                const baseClasses = `block px-4 py-2 text-sm rounded-lg text-${option.color}-700 dark:text-${option.color}-300 hover:bg-gray-100 dark:hover:bg-gray-600`;

                if (option.isModalLink) {
                    return (
                        <ModalLink key={idx} href={option.route} closeButton={false} panelClasses="bg-white dark:bg-gray-800 rounded-lg" className={baseClasses} >
                            {renderContent(option)}
                        </ModalLink>
                    );
                }

                if (option.isButton) {
                    return (
                        <button key={idx} type="button" onClick={option.onClick} className={`${baseClasses} w-full text-left`} >
                            {renderContent(option)}
                        </button>
                    );
                }

                return (
                    <Link key={idx} href={option.route} className={baseClasses}>
                        {renderContent(option)}
                    </Link>
                );
            })}
        </div >
    );
}

