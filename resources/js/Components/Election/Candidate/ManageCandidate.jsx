import LongDropdown from "@/Components/LongDropdown";
import { useState } from "react";
import { useForm } from '@inertiajs/react';
import DeleteModal from '@/Components/DeleteModal';
import CandidateForm from "./CandidateForm";
import CandidateList from "./CandidateList";

export default function ManageCandidate({ election, candidates, options }) {
    const [showCandidate, setShowCandidate] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const { positionOptions, partylistOptions } = options;

    const { data, setData, post, patch, processing, errors } = useForm({
        partylist: '',
        position: '',
        name: '',
        description: '',
    });

    const [selectedId, setSelectedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [viewedId, setViewedId] = useState(null);


    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing && selectedId) {
            patch(route('admin.election.candidates.update', [election.id, selectedId]), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('partylist', '');
                    setData('position', '');
                    setData('name', '');
                    setData('description', '');
                    setIsEditing(false);
                    setSelectedId(null);
                },
            });
        }
        else {
            post(route('admin.election.candidates.store', election.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('partylist', '');
                    setData('position', '');
                    setData('name', '');
                    setData('description', '');
                },
            });
        }

    };

    const handleView = (id) => {
        setViewedId(viewedId === id ? null : id);
    };

    const handleEdit = (candidate) => {
        setIsEditing(true);
        setSelectedId(candidate.id);

        setData('partylist', candidate?.partylist.id);
        setData('position', candidate?.position.id);
        setData('name', candidate?.name);
        setData('description', candidate?.description ?? '');
    };

    const handleCancelEdit = () => {
        setData('partylist', '');
        setData('position', '');
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
        setData('partylist', '');
        setData('position', '');
        setData('name', '');
        setData('description', '');
        setIsEditing(false);
    };

    return (
        <div>
            <LongDropdown className="mt-4" componentName={"Manage Candidate"} showComponent={showCandidate} setShowComponent={setShowCandidate} />
            <div className={`px-6 py-5 bg-white dark:bg-gray-800 shadow-sm rounded-lg 
            transition-all duration-300 ease-out overflow-hidden
                    ${showCandidate ? 'opacity-100 h-auto translate-y-0 mt-2 px-6 py-5' :
                    'opacity-0 h-0 translate-y-2 mt-0 px-0 py-0 pointer-events-none'}`} >

                <CandidateForm
                    actions={{ handleCancelEdit, handleSubmit }}
                    isEditing={isEditing}
                    form={{ data, setData, errors, processing }}
                    options={{ positionOptions, partylistOptions }}
                />

                <h1 className="mt-6 mb-2 text-gray-900 dark:text-white text-sm">
                    Candidates Created
                </h1>

                <CandidateList candidates={candidates}
                    actions={{ handleEdit, handleDelete }}
                    state={{ isEditing, selectedId }}
                />
            </div>


            {/* delete position modal */}
            <DeleteModal
                entityName="partylist"
                deleteRoute="admin.election.candidates.destroy"
                params={[election.id, selectedId]}
                confirmingDeletion={confirmingDeletion}
                setConfirmingDeletion={setConfirmingDeletion}
            />
        </div>
    );
}