import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import WarningModal from '@/Components/WarningModal';
import PartylistSelectionView from '@/Components/Election/Partylist/PartylistSelectionView';
import LongDropdown from '@/Components/LongDropdown';
import ElectionResultsView from '@/Components/Election/Results/ElectionResultsView';
import IntegrityChecker from '@/Components/Election/VoteIntegrity/IntegrityChecker';
import ExportResults from '@/Components/Election/Results/ExportResults';

// Dummy data for testing
const dummyResults = {
    positions: [
        {
            id: 1,
            name: "President",
            position_total_votes: 245,
            eligible_voter_count: 450,
            candidates: [
                {
                    id: 1,
                    name: "Juan dela Cruz",
                    partylist: "Unity Party",
                    vote_count: 142,
                    percent_of_position: 57.96
                },
                {
                    id: 2,
                    name: "Maria Santos",
                    partylist: "Progressive Alliance",
                    vote_count: 103,
                    percent_of_position: 42.04
                }
            ]
        },
        {
            id: 2,
            name: "Vice President",
            position_total_votes: 238,
            eligible_voter_count: 450,
            candidates: [
                {
                    id: 3,
                    name: "Carlos Reyes",
                    partylist: "Unity Party",
                    vote_count: 156,
                    percent_of_position: 65.55
                },
                {
                    id: 4,
                    name: "Ana Rodriguez",
                    partylist: "Progressive Alliance",
                    vote_count: 82,
                    percent_of_position: 34.45
                }
            ]
        }
    ],
    metrics: {
        eligibleVoterCount: 450,
        votesCast: 483,
        progressPercent: 107.33
    }
};

export default function FinalizedElection({ election, setup, results }) {
    const { positions = [], partylists = [], candidates = [] } = setup;
    const [confirm, setConfirm] = useState(false);
    const [showPartylists, setShowPartylists] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Use dummy data for testing - remove this line when using real data
    const resultsData = dummyResults;

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirm} className="mb-4" />

                {/* Integrity Checker Section */}
                <IntegrityChecker
                    election={election}
                    isVoter={false}
                />

                {/* Results Section */}
                <LongDropdown
                    className="mt-4"
                    componentName={"Results"}
                    showComponent={showResults}
                    setShowComponent={setShowResults}
                />

                <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-all duration-300 ease-out overflow-hidden 
                    ${showResults ? 'p-6 mt-2 h-auto opacity-100 translate-y-0' :
                        'p-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <ElectionResultsView results={resultsData} />
                </div>

                {/* Partylists Section */}
                <LongDropdown
                    className="mt-4"
                    componentName={"Party Lists"}
                    showComponent={showPartylists}
                    setShowComponent={setShowPartylists}
                />

                <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-all duration-300 ease-out overflow-hidden 
                    ${showPartylists ? 'px-6 pb-5 mt-2 h-auto opacity-100 translate-y-0' :
                        'px-0 pb-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <PartylistSelectionView partylists={partylists} positions={positions} candidates={candidates} useWhite='true' />
                </div>
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

FinalizedElection.layout = (page) => {
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

    const button = (
        <ExportResults election={election} />
    )

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};

