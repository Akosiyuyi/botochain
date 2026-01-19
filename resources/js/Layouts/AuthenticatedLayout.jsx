import NavBar from "@/Components/NavBar";
import SideBar from "@/Components/SideBar";
import { usePage, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AuthenticatedLayout({ header, children, button = false }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const flash = usePage().props.flash ?? {};
    const { errors } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }

        if (errors && Object.keys(errors).length > 0) {
            toast.error("Please fix the highlighted fields.");
        }
    }, [flash, errors]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative z-0">
            <Toaster
                position="top-center"
                reverseOrder={false}
                containerStyle={{ zIndex: 9999 }}
            />

            <NavBar
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
            />
            <SideBar
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
            />
            <div className="xl:ml-56">
                <div className="mt-12 pt-6 px-6 lg:px-12">
                    {header && (
                        <header>
                            <div className="w-full py-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                                    <div className="flex-1">
                                        {header}
                                    </div>
                                    {button && (
                                        <div className="w-full md:w-auto">
                                            {/* Extract children from button div and make responsive */}
                                            {button?.props?.children ? (
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                    {button.props.children}
                                                </div>
                                            ) : (
                                                button
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>
                    )}
                    <main className="pb-6 sm:mx-0">{children}</main>
                </div>
            </div>
        </div>
    );
}
