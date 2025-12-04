import DragAndDropUploader from '@/Components/DragAndDropUploader';
import FileUploadPreviewTable from '@/Components/FileUploadPreviewTable';
import ListPreview from '@/Components/ListPreview';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';

export default function BulkUpload() {
    const [results, setResults] = useState(null);
    const [expectedSchoolLevel, setExpectedSchoolLevel] = useState(null);
    return (
        <>
            <Head title="Bulk Upload" />
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-center w-full">
                    {/* drag and drop upload section */}
                    <DragAndDropUploader setResults={setResults} setExpectedSchoolLevel={setExpectedSchoolLevel} />
                </div>
                {results && (
                    <>
                        <ListPreview school_level={expectedSchoolLevel} />
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
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
            Bulk Uploader
        </h2>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};
