import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import PartylistSelectionView from '@/Components/Election/Partylist/PartylistSelectionView';
import LongDropdown from '@/Components/LongDropdown';
import ElectionResultsView from '@/Components/Election/Results/ElectionResultsView';
import IntegrityChecker from '@/Components/Election/VoteIntegrity/IntegrityChecker';
import PrimaryButton from '@/Components/PrimaryButton';

export default function OngoingElection({ election, setup, results, vote }) {
    const { positions = [], partylists = [], candidates = [] } = setup;
    const [confirm, setConfirm] = useState(false);
    const [showPartylists, setShowPartylists] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const resultsData = results;

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirm} isVoter={true} className="mb-4" />

                {/* Integrity Checker Section */}
                <IntegrityChecker
                    election={election}
                    vote={vote}
                    isVoter={true}
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
                    componentName={"Partylists"}
                    showComponent={showPartylists}
                    setShowComponent={setShowPartylists}
                />

                <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-all duration-300 ease-out overflow-hidden 
                    ${showPartylists ? 'px-6 pb-5 mt-2 h-auto opacity-100 translate-y-0' :
                        'px-0 pb-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <PartylistSelectionView partylists={partylists} positions={positions} candidates={candidates} useWhite='true' />
                </div>
            </div>
        </>
    );
}

OngoingElection.layout = (page) => {
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

    const button = (
        <>
            <Link href={route('voter.election.vote.create', election.id)}>
                <PrimaryButton>
                    View Ballot
                </PrimaryButton>
            </Link>
        </>

    )

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};

