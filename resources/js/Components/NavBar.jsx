import { Link, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/Components/ThemeToggle";
import ebotoLogoWithColor from '../../images/EBOTO_logo_withColor.png';

export default function NavBar({ showSidebar, setShowSidebar }) {
    const user = usePage().props.auth.user; // get user details
    const userRoles = user?.roles || [];    // get user roles
    const dashboardRoute =
        userRoles.includes("admin") || userRoles.includes("super-admin")
            ? "admin.dashboard"
            : "voter.dashboard"; // route for logo

    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-2 xl:px-5 xl:pl-3">
                <div className="flex items-center justify-between">
                    {/* Left */}
                    <div className="flex items-center">
                        {/* 🍔 Hamburger */}
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            type="button"
                            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg xl:hidden hover:bg-gray-100 
                            focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white
                            dark:focus:ring-gray-600"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 
                                    0 010 1.5H2.75A.75.75 
                                    0 012 4.75zm0 10.5a.75.75 
                                    0 01.75-.75h7.5a.75.75 
                                    0 010 1.5h-7.5a.75.75 
                                    0 01-.75-.75zM2 10a.75.75 
                                    0 01.75-.75h14.5a.75.75 
                                    0 010 1.5H2.75A.75.75 
                                    0 012 10z"
                                />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href={route(dashboardRoute)} className="flex ms-2 md:me-24">
                            <img
                                src={ebotoLogoWithColor}
                                className="h-8 me-2"
                                alt="Logo"
                            />
                            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                                Boto<span className='text-green-700'>Chain</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                aria-expanded={showUserMenu}
                                aria-controls="user-menu"
                                type="button"
                                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex justify-center items-center font-bold">{user.name.charAt(0)}
                                </div>
                            </button>

                            {showUserMenu && (
                                <div id="user-menu" className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-2 dark:bg-gray-700">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p className="font-medium">{user?.name ?? "Guest"}</p>
                                        <p className="truncate">{user?.email ?? ""}</p>
                                    </div>
                                    <hr className="border-gray-200 dark:border-gray-500 mb-2" />
                                    <div className='flex flex-col items-center'>
                                        <Link
                                            onClick={() => setShowUserMenu(false)}
                                            href={route("profile.edit")}
                                            className="w-56 text-left px-4 py-2 text-sm rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            Profile Settings
                                        </Link>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-56 text-left px-4 py-2 text-sm text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            Sign out
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
