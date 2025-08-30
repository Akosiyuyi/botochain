import NavBar from "@/Components/NavBar";
import SideBar from "@/Components/SideBar";
import { usePage, Link } from "@inertiajs/react";
import { useState } from "react";
import { LayoutDashboard, GraduationCap, Upload, BookUser, User } from "lucide-react";

export default function AuthenticatedLayout({ header, children, button = false }) {
    const user = usePage().props.auth.user;
    const userRoles = user?.roles || [];
    const dashboardRoute = userRoles.includes("admin")
        ? "admin.dashboard"
        : "voter.dashboard";

    const [showSidebar, setShowSidebar] = useState(false);

    const adminButtons = [
        {
            title: "Dashboard",
            route: "admin.dashboard",
            icon: LayoutDashboard,
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

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <NavBar
                dashboardRoute={dashboardRoute}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
            />
            <SideBar
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                sidebarButtons={sidebarButtons}
            />
            <div className="lg:ml-64">
                <div className="mt-14">
                    {header && (
                        <header>
                            <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 flex justify-between">
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
