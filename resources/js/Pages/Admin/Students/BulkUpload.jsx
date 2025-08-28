import DragAndDropUploader from '@/Components/DragAndDropUploader';
import FileUploadPreviewTable from '@/Components/FileUploadPreviewTable';
import ListPreview from '@/Components/ListPreview';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import React from 'react';

export default function BulkUpload() {

    const students = [
        { student_id: "STU001", full_name: "Alice Santos", school_level: "elementary", grade_year: "Grade 5", course: null, section: "A" },
        { student_id: "STU002", full_name: "Ben Cruz", school_level: "elementary", grade_year: "Grade 6", course: null, section: "B" },
        { student_id: "STU003", full_name: "Carla Reyes", school_level: "junior_high", grade_year: "Grade 8", course: null, section: "Blue" },
        { student_id: "STU004", full_name: "David Tan", school_level: "junior_high", grade_year: "Grade 9", course: null, section: "Red" },
        { student_id: "STU005", full_name: "Ella Lim", school_level: "senior_high", grade_year: "Grade 11", course: "STEM", section: "1A" },
        { student_id: "STU006", full_name: "Francis Ong", school_level: "senior_high", grade_year: "Grade 12", course: "ABM", section: "2B" },
        { student_id: "STU007", full_name: "Grace Dela Cruz", school_level: "college", grade_year: "1st Year", course: "BSIT", section: "CS1" },
        { student_id: "STU008", full_name: "Henry Bautista", school_level: "college", grade_year: "2nd Year", course: "BSBA", section: "BA2" },
        { student_id: "STU009", full_name: "Isabella Ramos", school_level: "college", grade_year: "3rd Year", course: "BSN", section: "N3" },
        { student_id: "STU010", full_name: "Jacob Villanueva", school_level: "college", grade_year: "4th Year", course: "BSA", section: "A4" },
        { student_id: "STU011", full_name: "Kimberly Uy", school_level: "senior_high", grade_year: "Grade 12", course: "HUMSS", section: "2C" },
        { student_id: "STU012", full_name: "Leo Fernandez", school_level: "junior_high", grade_year: "Grade 7", course: null, section: "Green" },
        { student_id: "STU013", full_name: "Mia Garcia", school_level: "elementary", grade_year: "Grade 4", course: null, section: "C" },
        { student_id: "STU014", full_name: "Nathan Torres", school_level: "college", grade_year: "1st Year", course: "BSCS", section: "CS2" },
        { student_id: "STU015", full_name: "Olivia Mendoza", school_level: "college", grade_year: "2nd Year", course: "BSIT", section: "CS3" },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Bulk Uploader
                </h2>
            }
        >
            <Head title="Bulk Upload" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-center w-full">
                    {/* drag and drop upload section */}
                    <DragAndDropUploader />
                </div>
                <ListPreview />
                <FileUploadPreviewTable
                    students={students}
                    variant="new" />

                <FileUploadPreviewTable
                    students={students}
                    variant="existing" />

                <FileUploadPreviewTable
                    students={students}
                    variant="incomplete" />

                <FileUploadPreviewTable
                    students={students}
                    variant="missing" />
            </div>
        </AuthenticatedLayout>
    );
}
