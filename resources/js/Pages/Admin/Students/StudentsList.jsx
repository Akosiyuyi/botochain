import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatsBox from '@/Components/StatsBox';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Table from '@/Components/Table';

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
                            onEdit={(student) => console.log("Edit student:", student)}
                            renderCell={(row, key, { onEdit }) => {
                                if (key === "status") {
                                    return row.status != "enrolled" ? (
                                        <span className="text-red-600">Unenrolled</span>
                                    ) : (
                                        <span className="text-green-600">Enrolled</span>
                                    );
                                }
                                if (key === "action") {
                                    return (
                                        <button onClick={() => onEdit(row)} className="text-blue-600 hover:underline">
                                            Edit
                                        </button>
                                    );
                                }
                                return row[key];
                            }}
                            filterFn={(row, option, defaultOption) => {
                                if (option === defaultOption) return true;

                                if (option === "Enrolled") {
                                    return !row.is_graduated;
                                }
                                if (option === "Unenrolled") {
                                    return row.is_graduated;
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
            <PrimaryButton>Add Student</PrimaryButton>
            <Link href={route("admin.bulk-upload.index")}>
                <SecondaryButton>Upload CSV</SecondaryButton>
            </Link>
        </div>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};