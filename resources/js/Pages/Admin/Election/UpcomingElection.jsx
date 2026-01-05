import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import WarningModal from '@/Components/WarningModal';
import PartylistSelectionView from '@/Components/Election/Partylist/PartylistSelectionView';

export default function UpcomingElection({ election, setup }) {
    const { positions = [], partylists = [], candidates = [] } = setup;

    const [confirm, setConfirm] = useState(false);

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirm} />
                <PartylistSelectionView partylists={partylists} positions={positions} candidates={candidates} />
            </div>

            <WarningModal
                entityName={"election"}
                routeName={"admin.election.restoreToDraft"}
                params={election.id}
                handleState={{ confirm, setConfirm }}
                method='patch'
                modalTitle='Restore Election to Draft'
                description="Restoring this election to draft will make it editable again. It will no longer appear as upcoming or ongoing until re‑finalized, and its schedule will be cleared and must be set up again."
            />
        </>
    );
}

UpcomingElection.layout = (page) => {
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

