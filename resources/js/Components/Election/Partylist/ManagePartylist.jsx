import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import noElectionsFlat from '@images/NoElectionsFlat.png';
import PrimaryButton from '@/Components/PrimaryButton';
import LongDropdown from '../../LongDropdown';
import TextArea from '../../TextArea';
import PartylistItem from './PartylistItem';
import DangerButton from '@/Components/DangerButton';
import DeleteModal from '@/Components/DeleteModal';

export default function ManagePartylist({ election, partylists }) {
    const [showPartylist, setShowPartylist] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const { data, setData, post, patch, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const [selectedId, setSelectedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [viewedId, setViewedId] = useState(null);


    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing && selectedId) {
            patch(route('admin.election.partylists.update', [election.id, selectedId]), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('name', '');
                    setData('description', '');
                    setIsEditing(false);
                    setSelectedId(null);
                },
            });
        }
        else {
            post(route('admin.election.partylists.store', election.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('name', '');
                    setData('description', '');
                },
            });
        }

    };

    const handleView = (id) => {
        setViewedId(viewedId === id ? null : id);
    };

    const handleEdit = (partylist) => {
        setIsEditing(true);
        setSelectedId(partylist.id);

        setData('name', partylist.name);
        setData('description', partylist.description);
    };

    const handleCancelEdit = () => {
        setData('name', '');
        setData('description', '');

        // exit edit mode
        setIsEditing(false);
        setSelectedId(null);
    };

    const handleDelete = (id) => {
        setSelectedId(id);
        setConfirmingDeletion(true);

        // reset form incase in edit mode
        setData('name', '');
        setData('description', '');
        setIsEditing(false);
    };

    return (
        <div>
            <LongDropdown className="mt-4" componentName={"Manage Partylist"} showComponent={showPartylist} setShowComponent={setShowPartylist} />
            <div className={`px-6 py-5 bg-white dark:bg-gray-800 shadow-sm rounded-lg 
            transition-all duration-300 ease-out overflow-hidden
                    ${showPartylist ? 'opacity-100 h-auto translate-y-0 mt-2 px-6 py-5' :
                    'opacity-0 h-0 translate-y-2 mt-0 px-0 py-0 pointer-events-none'}`} >
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <InputLabel htmlFor="name" value={isEditing ? "Edit Partylist" : "Create New Partylist"} />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    placeholder="Enter Partylist Name"
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div className="lg:col-span-2">
                                <InputLabel htmlFor="description" value={isEditing ? "Edit Partylist Description" : "Partylist Description"} />
                                <TextArea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    placeholder="Summarize the partylist’s purpose (optional)"
                                    className="mt-1 block w-full"
                                    autoComplete="off"
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <PrimaryButton type={"submit"} disabled={processing}>{isEditing ? "Update Partylist" : "Create Partylist"}</PrimaryButton>
                            {isEditing && (
                                <DangerButton type="button" onClick={handleCancelEdit}>
                                    Cancel
                                </DangerButton>
                            )}
                        </div>
                    </form>




                    <h1 className="mt-6 mb-2 text-gray-900 dark:text-white text-sm">
                        Partylist's Created
                    </h1>

                    {partylists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-12">
                            <img src={noElectionsFlat} alt="No Elections" className="w-80" />
                            <div className="text-gray-500 dark:text-gray-200 text-lg">
                                No partylists yet.
                            </div>
                        </div>
                    ) : (
                        <div className="pb-6">
                            {/* MOBILE / TABLET — single column */}
                            < ul className="flex flex-col gap-2 lg:hidden">
                                {partylists.map((partylist, index) => (
                                    <PartylistItem
                                        key={partylist.id}
                                        partylist={partylist}
                                        index={index}
                                        state={{ isEditing, selectedId, viewedId }}
                                        actions={{ handleView, handleEdit, handleDelete }}
                                    />
                                ))}
                            </ul>

                            {/* DESKTOP — two columns */}
                            <div className="hidden lg:flex gap-2 w-full min-w-0">
                                <ul className="flex flex-col gap-2 flex-1 w-full min-w-0">
                                    {partylists
                                        .map((partylist, index) => ({ partylist, index }))
                                        .filter(({ index }) => index % 2 === 0)
                                        .map(({ partylist, index }) => (
                                            <PartylistItem
                                                key={partylist.id}
                                                partylist={partylist}
                                                index={index}
                                                state={{ isEditing, selectedId, viewedId }}
                                                actions={{ handleView, handleEdit, handleDelete }}
                                            />
                                        ))}
                                </ul>

                                <ul className="flex flex-col gap-2 flex-1 w-full min-w-0">
                                    {partylists
                                        .map((partylist, index) => ({ partylist, index }))
                                        .filter(({ index }) => index % 2 !== 0)
                                        .map(({ partylist, index }) => (
                                            <PartylistItem
                                                key={partylist.id}
                                                partylist={partylist}
                                                index={index}
                                                state={{ isEditing, selectedId, viewedId }}
                                                actions={{ handleView, handleEdit, handleDelete }}
                                            />
                                        ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>
            </div>


            {/* delete position modal */}
            <DeleteModal
                entityName="partylist"
                deleteRoute="admin.election.partylists.destroy"
                params={[election.id, selectedId]}
                confirmingDeletion={confirmingDeletion}
                setConfirmingDeletion={setConfirmingDeletion}
            />
        </div >
    );
}