import DragAndDropUploader from '@/Components/DragAndDropUploader';
import ListPreview from '@/Components/ListPreview';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import React from 'react';

export default function BulkUpload() {
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
            </div>
        </AuthenticatedLayout>
    );
}
