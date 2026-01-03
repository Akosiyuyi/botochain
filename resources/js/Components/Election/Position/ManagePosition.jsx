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
                preserveScroll: true,
                onSuccess: () => {
                    setData('position', '');
                    setData('school_levels', []);
                    setData('year_levels', []);
                    setData('courses', []);
                    setIsEditing(false);
                    setSelectedId(null);
                },
            });
        } else {
            post(route('admin.election.positions.store', election.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('position', '');
                    setData('school_levels', []);
                    setData('year_levels', []);
                    setData('courses', []);
                },
            });
        }
    };

    const handleDelete = (id) => {
        setSelectedId(id);
        setConfirmingPositionDeletion(true);

        // reset form incase in edit mode
        setData('position', '');
        setData('school_levels', []);
        setData('year_levels', []);
        setData('courses', []);
        setIsEditing(false);
    };

    const handleEdit = (pos) => {
        setIsEditing(true);
        setSelectedId(pos.id);

        // 1️⃣ position name
        setData('position', pos.name);

        // 2️⃣ school levels (ids)
        const schoolLevels = pos.school_levels.map(level => level.value);

        // 3️⃣ year levels (unique)
        const yearLevels = [
            ...new Set(
                pos.school_levels.flatMap(level =>
                    level.units.map(u => u.year_level)
                )
            ),
        ];

        // 4️⃣ courses (only if present)
        const courses = [
            ...new Set(
                pos.school_levels.flatMap(level =>
                    level.units
                        .filter(u => u.course)
                        .map(u => u.course)
                )
            ),
        ];

        // 5️⃣ set all at once (important!)
        setData({
            position: pos.name,
            school_levels: schoolLevels,
            year_levels: yearLevels,
            courses,
        });
    };


    const handleCancelEdit = () => {
        // reset all form fields
        reset();

        // explicitly clear the position field
        setData('position', '');
        setData('school_levels', []);
        setData('year_levels', []);
        setData('courses', []);

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
            <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg 
                grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 
                transition-all duration-300 ease-out overflow-hidden 
                ${showPosition ? 'px-6 py-5 mt-2 h-auto opacity-100 translate-y-0' :
                    'px-0 py-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`} >
                        
                {/* Left section - create/edit position */}
                <PositionForm
                    handleSubmit={handleSubmit}
                    handleCancelEdit={handleCancelEdit}
                    isEditing={isEditing}
                    form={{ data, setData, errors, processing }}
                    options={{ schoolLevelOptions, yearLevelOptions, courseOptions }}
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
