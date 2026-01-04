import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import ManagePosition from '@/Components/Election/Position/ManagePosition';
import ManagePartylist from '@/Components/Election/Partylist/ManagePartylist';
import DeleteModal from '@/Components/DeleteModal';
import ManageCandidate from '@/Components/Election/Candidate/ManageCandidate';
import ManageSchedule from '@/Components/Election/Schedule/ManageSchedule';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ManageElection({ election, setup, schoolOptions }) {
    const { positions = [], partylists = [], candidates = [], schedule = [], flags } = setup;
    const { yearLevelOptions, courseOptions, positionOptions, partylistOptions } = schoolOptions;

    const [confirmingElectionDeletion, setConfirmingElectionDeletion] = useState(false);

    const publishElection = (e) => {
        e.preventDefault();
    }

    console.log(flags);

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirmingElectionDeletion} />
                <ManagePosition election={election} positions={positions} options={{ yearLevelOptions, courseOptions }} flag={flags.position} />
                <ManagePartylist election={election} partylists={partylists} flag={flags.partylist} />
                <ManageCandidate election={election} candidates={candidates} options={{ positionOptions, partylistOptions }} flag={flags.candidate} />
                <ManageSchedule election={election} schedule={schedule} flag={flags.schedule} />
                <form className="mt-6 w-full flex justify-center" onSubmit={publishElection}>
                    <PrimaryButton className="w-full sm:w-1/2 md:w-3/5 lg:w-1/3 flex justify-center">Finalize</PrimaryButton>
                </form>
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

