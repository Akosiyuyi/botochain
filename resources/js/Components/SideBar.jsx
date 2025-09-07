import { usePage, Link } from "@inertiajs/react";
import { useRef, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, LayoutDashboard, GraduationCap, Upload, BookUser, User, VoteIcon } from "lucide-react";

export default function SideBar({ showSidebar, setShowSidebar }) {
    const sidebarRef = useRef(null);
    const [openMenu, setOpenMenu] = useState(null);

    const user = usePage().props.auth.user;
    const userRoles = user?.roles || [];

    // side bar buttons
    const adminButtons = [
        {
            title: "Dashboard",
            route: "admin.dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Election",
            route: "admin.election.index",
            icon: VoteIcon,
        },
        {
            title: "Student",
            icon: GraduationCap,
            children: [
                { title: "Students List", route: "admin.students.index", icon: BookUser },
                { title: "Bulk Upload", route: "admin.bulk-upload", icon: Upload },
            ],
        },
        {
            title: "User",
            route: "admin.users.index",
            icon: User,
        },
    ];

    const voterButtons = [
        {
            title: "Dashboard",
            route: "voter.dashboard",
            icon: LayoutDashboard,
        },];

    const sidebarButtons = userRoles.includes("admin") ? adminButtons : voterButtons;
    // side bar buttons end

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
            ${showSidebar ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}`}
            aria-label="Sidebar"
        >
            <div className="h-full px-3 pb-4 overflow-y-auto">
                <ul className="space-y-2 font-medium">
                    {sidebarButtons.map((item, idx) => (
                        <li key={idx}>
                            {item.children ? (
                                <>
                                    {/* Parent button */}
                                    <button
                                        type="button"
                                        className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white 
                                                   hover:bg-green-700 hover:text-white"
                                        onClick={() =>
                                            setOpenMenu(openMenu === idx ? null : idx)
                                        }
                                    >
                                        {item.icon && (
                                            <item.icon className="w-5 h-5 text-inherit dark:text-inherit" />
                                        )}
                                        <span className="ms-3 flex-1 text-left">
                                            {item.title}
                                        </span>
                                        {openMenu === idx ? (
                                            <ChevronUp className="w-4 h-4 ml-auto text-inherit" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 ml-auto text inherit" />
                                        )}
                                    </button>

                                    {/* Dropdown children */}
                                    {openMenu === idx && (
                                        <ul className="ml-6 mt-2 space-y-1">
                                            {item.children.map((child, cIdx) => (
                                                <li key={cIdx}>
                                                    <Link
                                                        href={route(child.route)}
                                                        className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                                                                    hover:bg-green-700 hover:text-white"
                                                    >
                                                        {child.icon && (
                                                            <child.icon className="w-5 h-5 text-inherit" />
                                                        )}
                                                        <span className="ms-3 text-inherit">
                                                            {child.title}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={route(item.route)}
                                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
                                               hover:bg-green-700 hover:text-white"
                                >
                                    {item.icon && (
                                        <item.icon className="w-5 h-5 text-inherit dark:text-inherit " />
                                    )}
                                    <span className="ms-3 text-inherit">{item.title}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
