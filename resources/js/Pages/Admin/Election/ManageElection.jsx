import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import ManagePosition from '@/Components/Election/Position/ManagePosition';
import ManagePartylist from '@/Components/Election/ManagePartylist';
import DeleteModal from '@/Components/DeleteModal';

export default function ManageElection({ election, positions = [], partylists = [], yearLevelOptions, courseOptions }) {
    const [ confirmingElectionDeletion, setConfirmingElectionDeletion ] = useState(false);

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirmingElectionDeletion} />
                <ManagePosition election={election} positions={positions} yearLevelOptions={yearLevelOptions} courseOptions={courseOptions}/>
                <ManagePartylist election={election} partylists={partylists} />
            </div>

            <DeleteModal
                entityName="election"
                deleteRoute="admin.election.destroy"
                params={election.id}
                confirmingDeletion={confirmingElectionDeletion}
                setConfirmingDeletion={setConfirmingElectionDeletion}
            />
        </>
    );
}

ManageElection.layout = (page) => {
    const election = page.props.election;
    const header = (
        <div className="text-xl text-black dark:text-white font-semibold mb-2">
            <Link href={route('admin.election.index')} className="hover:underline">
                Election
            </Link>
            <span className="mx-2">›</span>
            <span className="font-medium">{election.title}</span>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};

