import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

import noElectionsFlat from '@images/NoElectionsFlat.png';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton'; // import DangerButton
import LongDropdown from '@/Components/LongDropdown';
import DeleteModal from '@/Components/DeleteModal';
import PositionList from './PositionList';

export default function ManagePosition({ election, positions }) {
    const [showPosition, setShowPosition] = useState(false);
    const [confirmingPositionDeletion, setConfirmingPositionDeletion] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // track edit mode

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        position: '',
        school_level: [],
        year_level: [],
        course: [],
    });

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
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <InputLabel
                                    htmlFor="position"
                                    value={isEditing ? "Edit Position" : "Create New Position"}
                                />
                                <TextInput
                                    id="position"
                                    name="position"
                                    value={data.position}
                                    placeholder="Enter Position Title"
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    onChange={(e) => setData('position', e.target.value)}
                                />
                                <InputError message={errors.position} className="mt-2" />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {isEditing ? "Update Position" : "Create Position"}
                                </PrimaryButton>
                                {isEditing && (
                                    <DangerButton type="button" onClick={handleCancelEdit}>
                                        Cancel
                                    </DangerButton>
                                )}
                            </div>
                        </form>
                    </div>

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
