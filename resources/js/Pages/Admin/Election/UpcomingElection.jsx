import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import WarningModal from '@/Components/WarningModal';

export default function UpcomingElection({ election, setup, schoolOptions }) {
    const { positions = [], partylists = [], candidates = [], schedule = [], flags } = setup;
    const { yearLevelOptions, courseOptions, positionOptions, partylistOptions } = schoolOptions;

    const [confirm, setConfirm] = useState(false);

    const finalizeElection = (e) => {
        e.preventDefault();
        patch(route('admin.election.finalize', election.id), {
            preserveScroll: true,
        });
    };

    const allFlagsTrue = flags.position && flags.partylist && flags.candidate && flags.schedule;

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirm} />
            </div>

            <WarningModal
                entityName={"election"}
                routeName={"admin.election.restoreToDraft"}
                params={election.id}
                handleState={{ confirm, setConfirm }}
                method='patch'
                modalTitle='Restore Election to Draft'
                description='Reverting to draft means the election is editable once more. It will not be visible as upcoming or ongoing until you finalize it again.'
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

