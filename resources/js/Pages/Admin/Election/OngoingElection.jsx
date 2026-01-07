import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ManageElectionHeader from '@/Components/Election/ManageElectionHeader';
import WarningModal from '@/Components/WarningModal';
import PartylistSelectionView from '@/Components/Election/Partylist/PartylistSelectionView';
import LongDropdown from '@/Components/LongDropdown';
import HorizontalBarChart from '@/Components/Charts/HorizontalBarChart';

export default function OngoingElection({ election, setup }) {
    const { positions = [], partylists = [], candidates = [] } = setup;

    const [confirm, setConfirm] = useState(false);
    const [showPartylists, setShowPartylists] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Dummy data const 
    const dummyData = {
        title: "President",
        labels: [],
        values: [],
    };

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} setConfirmingElectionDeletion={setConfirm} />

                <LongDropdown
                    className="mt-4"
                    componentName={"Result"}
                    showComponent={showResult}
                    setShowComponent={setShowResult}
                />

                <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg   
                transition-all duration-300 ease-out overflow-hidden 
                ${showResult ? 'p-6 mt-2 h-auto opacity-100 translate-y-0' :
                        'p-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`} >
                    <h1 className="text-xl font-bold mb-4 dark:text-white">President</h1>
                    <HorizontalBarChart labels={dummyData.labels} values={dummyData.values} title={dummyData.title} />
                </div>

                <LongDropdown
                    className="mt-4"
                    componentName={"Partylists"}
                    showComponent={showPartylists}
                    setShowComponent={setShowPartylists}
                />

                <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg  
                transition-all duration-300 ease-out overflow-hidden 
                ${showPartylists ? 'px-6 pb-5 mt-2 h-auto opacity-100 translate-y-0' :
                        'px-0 pb-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`} >

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

OngoingElection.layout = (page) => {
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

