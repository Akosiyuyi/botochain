import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import noElectionsFlat from '@images/NoElectionsFlat.png';
import LongDropdown from '@/Components/LongDropdown';
import DeleteModal from '@/Components/DeleteModal';
import PositionList from './PositionList';
import PositionForm from './PositionForm';

export default function ManagePosition({ election, positions, yearLevelOptions, courseOptions }) {
    const [showPosition, setShowPosition] = useState(false);
    const [confirmingPositionDeletion, setConfirmingPositionDeletion] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // track edit mode

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        position: '',
        school_levels: [],
        year_levels: [],
        courses: [],
    });

    const schoolLevelOptions = election.school_levels;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing && selectedId) {
            patch(route('admin.election.positions.update', [election.id, selectedId]), {
                onSuccess: () => {
                    setData('position', '');
                    setIsEditing(false);
                    setSelectedId(null);
                },
            });
        } else {
            post(route('admin.election.positions.store', election.id), {
                onSuccess: () => setData('position', ''),
            });
        }
    };

    const handleDelete = (id) => {
        setSelectedId(id);
        setConfirmingPositionDeletion(true);

        // reset form incase in edit mode
        setData('position', '');
        setIsEditing(false);
    };

    const handleEdit = (pos) => {
        setIsEditing(true);
        setSelectedId(pos.id);
        setData('position', pos.name);
    };

    const handleCancelEdit = () => {
        // reset all form fields
        reset();

        // explicitly clear the position field
        setData('position', '');

        // exit edit mode
        setIsEditing(false);
        setSelectedId(null);
    };


    return (
        <div>
            <LongDropdown
                className="mt-4"
                componentName={"Manage Position"}
                showComponent={showPosition}
                setShowComponent={setShowPosition}
            />
            {showPosition && (
                <div className="px-6 py-5 bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Left section - create/edit position */}
                    <PositionForm
                        handleSubmit={handleSubmit}
                        handleCancelEdit={handleCancelEdit}
                        isEditing={isEditing}
                        data={data}
                        setData={setData}
                        processing={processing}
                        errors={errors}
                        schoolLevelOptions={schoolLevelOptions}
                        yearLevelOptions={yearLevelOptions}
                        courseOptions={courseOptions}
                    />

                    {/* Right section - list positions */}
                    <PositionList
                        positions={positions}
                        isEditing={isEditing}
                        selectedId={selectedId}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        noElectionsFlat={noElectionsFlat}
                    />
                </div>
            )}

            {/* delete position modal */}
            <DeleteModal
                entityName="position"
                deleteRoute="admin.election.positions.destroy"
                params={[election.id, selectedId]}
                confirmingDeletion={confirmingPositionDeletion}
                setConfirmingDeletion={setConfirmingPositionDeletion}
            />
        </div>
    );
}
