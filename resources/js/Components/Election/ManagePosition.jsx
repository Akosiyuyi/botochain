import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

import noElectionsFlat from '../../../images/NoElectionsFlat.png';
import PrimaryButton from '@/Components/PrimaryButton';
import LongDropdown from '../LongDropdown';
import DeleteModal from '../DeleteModal';
import { Pencil, Trash2 } from 'lucide-react';

export default function ManagePosition({ election, positions }) {
    const [showPosition, setShowPosition] = useState(false); // position component state management
    const [confirmingPositionDeletion, setConfirmingPositionDeletion] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        position: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.election.positions.store', election.id), {
            onSuccess: () => reset('position'),
        });
    };

    const handleDelete = (id) => {
        setSelectedId(id);
        setConfirmingPositionDeletion(true);
    };

    return (
        <div>
            <LongDropdown className="mt-4" componentName={"Manage Position"} showComponent={showPosition} setShowComponent={setShowPosition} />
            {showPosition && (
                <div className="px-6 py-5 bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Left section - create position */}
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <InputLabel htmlFor="position" value="Create New Position" />
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
                            <PrimaryButton type={"submit"} disabled={processing}>Create Position</PrimaryButton>
                        </form>
                    </div>

                    {/* Right section - list positions */}
                    <div className="lg:col-span-2">
                        <h1 className="text-gray-900 dark:text-white mb-1 text-sm">Positions Created</h1>
                        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            {positions.length === 0 && (
                                <li className="col-span-full flex flex-col items-center justify-center text-center py-12">
                                    <img
                                        src={noElectionsFlat}
                                        alt="No Elections"
                                        className="w-80"
                                    />
                                    <div className="text-gray-500 dark:text-gray-200 text-lg">
                                        No positions yet.
                                    </div>
                                </li>
                            )}
                            {positions.map((pos, index) => (

                                <li
                                    key={pos.id}
                                    className="flex items-center justify-between border border-green-600 rounded-lg overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 bg-green-600 text-white dark:text-black">{index + 1}</div>
                                        <span className="text-black dark:text-white">{pos.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <button className="pr-3 text-yellow-600 dark:text-yellow-500">
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pos.id)}
                                            className="pr-3 text-red-600 dark:text-red-500"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </div>
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