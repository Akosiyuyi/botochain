import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatsBox from '@/Components/StatsBox';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Table from '@/Components/Table';
import { ModalLink } from '@inertiaui/modal-react';
import DangerButton from '@/Components/DangerButton';

export default function StudentsList({ students, stats }) {
    return (
        <>
            <Head title="Students" />

            <div className="">
                <div className="mx-auto max-w-7xl">
                    <StatsBox stats={stats} />
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mt-6">
                        <Table
                            rows={students}
                            header={[
                                { key: "student_id", label: "Student ID", sortable: true },
                                { key: "name", label: "Name", sortable: true },
                                { key: "school_level", label: "School Level" },
                                { key: "year_level", label: "Year Level" },
                                { key: "course", label: "Course" },
                                { key: "section", label: "Section" },
                                { key: "status", label: "Status" },
                                { key: "action", label: "Action" },
                            ]}
                            optionList={["All", "Enrolled", "Unenrolled"]}
                            defaultOption="All"
                            renderCell={(row, key) => {
                                if (key === "status") {
                                    return row.status != "Enrolled" ? (
                                        <span className="text-red-600">Unenrolled</span>
                                    ) : (
                                        <span className="text-green-600">Enrolled</span>
                                    );
                                }
                                if (key === "action") {
                                    return (
                                        <ModalLink
                                            href={route("admin.students.edit", row.id)} // 👈 pass student id
                                            closeButton={false}
                                            panelClasses="bg-white dark:bg-gray-800 rounded-lg"
                                        >
                                            <button className="text-blue-600 hover:underline">Edit</button>
                                        </ModalLink>
                                    );
                                }
                                return row[key];
                            }}
                            filterFn={(row, option, defaultOption) => {
                                if (option === defaultOption) return true;

                                if (option === "Enrolled") {
                                    return row.status === "Enrolled"
                                }
                                if (option === "Unenrolled") {
                                    return row.status === "Unenrolled"
                                }
                                return true;
                            }}
                            getHeaderTitle={(option) => (option === "All" ? "All Students List" : `${option} Student List`)}
                            getHeaderSubtitle={(option) => (option === "All" ? "Includes all registered students, enrolled and unenrolled." : `List of all registered ${option.toLowerCase()} students only.`)}
                            searchPlaceholder="Search students..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

StudentsList.layout = (page) => {
    const header = (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
            Students List
        </h2>
    );

    const button = (
        <div className="flex gap-4">
            <ModalLink
                href={route("admin.students.create")}
                closeButton={false}
                panelClasses="bg-white dark:bg-gray-800 rounded-lg"
            >
                <PrimaryButton>Add Student</PrimaryButton>
            </ModalLink>
            <Link href={route("admin.bulk-upload.index")}>
                <SecondaryButton>Upload CSV</SecondaryButton>
            </Link>
            <ModalLink
                href={route("admin.students.showConfirmUnenroll")}
                closeButton={false}
                panelClasses="bg-white dark:bg-gray-800 rounded-lg"
            >
                <DangerButton>Unenroll All</DangerButton>
            </ModalLink>
            
        </div>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};