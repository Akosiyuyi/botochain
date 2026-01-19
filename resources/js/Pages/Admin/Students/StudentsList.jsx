import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatsBox from '@/Components/StatsBox';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Table from '@/Components/Table';
import { ModalLink } from '@inertiaui/modal-react';
import DangerButton from '@/Components/DangerButton';
import { Users, CheckCircle2, UserMinus, Ban, UserPlus, Upload, GraduationCap, Settings2 } from 'lucide-react';

export default function StudentsList({ students, stats }) {
    const statsData = (Array.isArray(stats) ? stats : []).map((s) => {
        const title = String(s.title || '').toLowerCase();
        let icon = Users;
        let color = 'indigo';

        if (title.includes('all')) { icon = Users; color = 'blue'; }
        if (title.includes('enrolled')) { icon = CheckCircle2; color = 'green'; }
        if (title.includes('no account')) { icon = UserMinus; color = 'yellow'; }
        if (title.includes('unenrolled')) { icon = Ban; color = 'red'; }

        return { ...s, icon, color };
    });

    return (
        <>
            <Head title="Students" />

            <div className="">
                <div className="mx-auto max-w-7xl gap-4 flex flex-col">
                    <StatsBox stats={statsData} showIcons={true} />
                    <Table
                        rows={students}
                        header={[
                            { key: "student_id", label: "Student ID", sortable: true },
                            { key: "name", label: "Name", sortable: true },
                            { key: "school_level", label: "School Level", sortable: true },
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
                                const isEnrolled = row.status === "Enrolled";
                                return (
                                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${isEnrolled
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        }`}>
                                        {isEnrolled ? (
                                            <CheckCircle2
                                                className="w-4 h-4 block"
                                                style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                            />
                                        ) : (
                                            <Ban
                                                className="w-4 h-4 block"
                                                style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                            />
                                        )}
                                        {isEnrolled ? 'Enrolled' : 'Unenrolled'}
                                    </span>
                                );
                            }

                            if (key === "action") {
                                return (
                                    <ModalLink
                                        href={route("admin.students.edit", row.id)}
                                        closeButton={false}
                                        panelClasses="bg-white dark:bg-gray-800 rounded-lg"
                                    >
                                        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                            <Settings2
                                                className="w-4 h-4 block"
                                                style={{ filter: 'drop-shadow(0 0 0.5px currentColor)' }}
                                            />
                                            <span className="text-sm font-medium">Edit</span>
                                        </button>
                                    </ModalLink>
                                );
                            }

                            return row[key];
                        }}
                        filterFn={(row, option, defaultOption) => {
                            if (option === defaultOption) return true;

                            if (option === "Enrolled") return row.status === "Enrolled";
                            if (option === "Unenrolled") return row.status === "Unenrolled";
                            return true;
                        }}
                        getHeaderTitle={(option) => (option === "All" ? "All Students" : `${option} Students`)}
                        getHeaderSubtitle={(option) =>
                            option === "All"
                                ? "Includes all registered students, enrolled and unenrolled."
                                : `List of all registered ${option.toLowerCase()} students only.`
                        }
                        searchPlaceholder="Search students..."
                    />
                </div>
            </div>
        </>
    );
}

StudentsList.layout = (page) => {
    const header = (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Students
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage student records and enrollment
            </p>
        </div>
    );

    const button = (
        <>
            <ModalLink
                href={route("admin.students.create")}
                closeButton={false}
                panelClasses="bg-white dark:bg-gray-800 rounded-lg"
            >
                <PrimaryButton className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                    <UserPlus className="w-4 h-4" />
                    <span>Add Student</span>
                </PrimaryButton>
            </ModalLink>

            <Link href={route("admin.bulk-upload.index")}>
                <SecondaryButton className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Upload className="w-4 h-4" />
                    <span>Upload CSV</span>
                </SecondaryButton>
            </Link>

            <ModalLink
                href={route("admin.students.showConfirmUnenroll")}
                closeButton={false}
                panelClasses="bg-white dark:bg-gray-800 rounded-lg"
            >
                <DangerButton className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                    <UserMinus className="w-4 h-4" />
                    <span>Unenroll All</span>
                </DangerButton>
            </ModalLink>
        </>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};