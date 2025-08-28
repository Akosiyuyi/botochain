import StudentsTable from '@/Components/StudentsTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function StudentsList() {

    const dummyStudents = [
        { id: 1, student_id: "STU2025001", full_name: "Juan Dela Cruz", school_level: "elementary", grade_year: "Grade 5", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 10:00:00" },
        { id: 2, student_id: "STU2025002", full_name: "Maria Santos", school_level: "elementary", grade_year: "Grade 6", course: null, section: "B", is_graduated: false, created_at: "2025-08-27 10:05:00" },
        { id: 3, student_id: "STU2025003", full_name: "Pedro Ramirez", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "C", is_graduated: false, created_at: "2025-08-27 10:10:00" },
        { id: 4, student_id: "STU2025004", full_name: "Angela Reyes", school_level: "junior_high", grade_year: "Grade 10", course: null, section: "A", is_graduated: false, created_at: "2025-08-27 10:15:00" },
        { id: 5, student_id: "STU2025005", full_name: "Carlo Mendoza", school_level: "senior_high", grade_year: "Grade 11", course: "STEM", section: "B", is_graduated: false, created_at: "2025-08-27 10:20:00" },
        { id: 6, student_id: "STU2025006", full_name: "Sophia Gonzales", school_level: "senior_high", grade_year: "Grade 12", course: "ABM", section: "C", is_graduated: false, created_at: "2025-08-27 10:25:00" },
        { id: 7, student_id: "STU2025007", full_name: "Mark Villanueva", school_level: "college", grade_year: "1st Year", course: "BS Computer Science", section: "CS-1A", is_graduated: false, created_at: "2025-08-27 10:30:00" },
        { id: 8, student_id: "STU2025008", full_name: "Hannah Bautista", school_level: "college", grade_year: "2nd Year", course: "BS Information Tech", section: "IT-2B", is_graduated: false, created_at: "2025-08-27 10:35:00" },
        { id: 9, student_id: "STU2025009", full_name: "John Cruz", school_level: "college", grade_year: "3rd Year", course: "BS Accountancy", section: "ACC-3C", is_graduated: false, created_at: "2025-08-27 10:40:00" },
        { id: 10, student_id: "STU2025010", full_name: "Erika Flores", school_level: "college", grade_year: "4th Year", course: "BS Nursing", section: "NRS-4A", is_graduated: true, created_at: "2025-08-27 10:45:00" }
    ];


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Students List
                </h2>
            }
        >
            <Head title="Students" />

            <div className="">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <StudentsTable students={dummyStudents} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
