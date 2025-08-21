import { Link } from "@inertiajs/react";
import { useRef, useEffect } from "react";

export default function SideBar({ showSidebar, setShowSidebar, sidebarButtons }) {
    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                showSidebar
            ) {
                setShowSidebar(false);
            }
        }
        if (showSidebar) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSidebar]);

    return (
        <aside
            ref={sidebarRef}
            className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform 
            bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700
            ${showSidebar ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
            aria-label="Sidebar"
        >
            <div className="h-full px-3 pb-4 overflow-y-auto">
                <ul className="space-y-2 font-medium">
                    {Object.entries(sidebarButtons).map(([routeName, label]) => (
                        <li key={routeName}>
                            <Link
                                href={route(routeName)}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                                         hover:bg-green-700 hover:text-white"
                            >
                                <span className="ms-3">{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
