import DragAndDropUploader from '@/Components/DragAndDropUploader';
import FileUploadPreviewTable from '@/Components/FileUploadPreviewTable';
import ListPreview from '@/Components/ListPreview';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, XCircle, Upload } from 'lucide-react';

export default function BulkUpload() {
    const [results, setResults] = useState(null);
    const [expectedSchoolLevel, setExpectedSchoolLevel] = useState(null);

    const resultStats = (results) => {
        if (!results) return [];

        const totalRows = results.valid?.length + results.missing?.length + results.errors?.length;
        return [
            { title: "All Rows", value: totalRows, icon: FileText, color: "blue" },
            { title: "Valid Rows", value: results.valid?.length, icon: CheckCircle2, color: "green" },
            { title: "Incomplete Rows", value: results.missing?.length, icon: AlertCircle, color: "yellow" },
            { title: "Error Rows", value: results.errors?.length, icon: XCircle, color: "red" },
        ];
    };

    return (
        <>
            <Head title="Bulk Upload" />
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-center w-full">
                    {/* drag and drop upload section */}
                    <DragAndDropUploader setResults={setResults} setExpectedSchoolLevel={setExpectedSchoolLevel} />
                </div>
                {results && (
                    <>
                        <ListPreview school_level={expectedSchoolLevel} resultStats={resultStats(results)} />
                        {results.valid?.length > 0 && (
                            <FileUploadPreviewTable
                                students={results.valid}
                                variant="validated"
                            />
                        )}

                        {results.missing?.length > 0 && (
                            <FileUploadPreviewTable
                                students={results.missing}
                                variant="incomplete"
                            />
                        )}

                        {results.errors?.length > 0 && (
                            <FileUploadPreviewTable
                                students={results.errors}
                                variant="error"
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
}

BulkUpload.layout = (page) => {
    const header = (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Bulk Uploader
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Import multiple students via CSV file
            </p>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};
