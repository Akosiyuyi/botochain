import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import PartylistSelectionView from '@/Components/Election/Partylist/PartylistSelectionView';

export default function UpcomingElection({ election, setup }) {
    const { positions = [], partylists = [], candidates = [] } = setup;

    const [confirm, setConfirm] = useState(false);

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirm} isVoter={true} />
                <PartylistSelectionView partylists={partylists} positions={positions} candidates={candidates} />
            </div>
        </>
    );
}

UpcomingElection.layout = (page) => {
    const election = page.props.election;
    const header = (
        <div className="text-xl text-black dark:text-white font-semibold mb-2">
            <Link href={route('voter.election.index')} className="hover:underline">
                Election
            </Link>
            <span className="mx-2">›</span>
            <span className="font-medium">{election.title}</span>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};

