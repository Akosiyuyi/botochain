import NavBar from "@/Components/NavBar";
import SideBar from "@/Components/SideBar";
import { usePage, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AuthenticatedLayout({ header, children, button = false }) {
    const [showSidebar, setShowSidebar] = useState(false);  // side bar state management
    const [openMenu, setOpenMenu ] = useState(null);

    // toast function
    const flash = usePage().props.flash ?? {}; // default to empty object
    const { errors } = usePage().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);

        // Show validation errors
        if (errors && Object.keys(errors).length > 0) {
            Object.values(errors).forEach((errMsg) => {
                toast.error(errMsg);
            });
        }
    }, [flash, errors]);


    return (
        // relative z-0 is just for ui-stacking to make modal in front
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative z-0"> 
            {/* Toast container */}
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
            <div className="xl:ml-64">
                <div className="mt-12 pt-6">
                    {header && (
                        <header>
                            <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                                {header}
                                {button && (
                                    <div>
                                        {button}
                                    </div>
                                )}
                            </div>
                        </header>
                    )}
                    <main className="pb-6 mx-4 sm:mx-0">{children}</main>
                </div>
            </div>
        </div>
    );
}
