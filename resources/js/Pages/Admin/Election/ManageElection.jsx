import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ManageElectionHeader from '@/Components/ManageElectionHeader';
import ManagePosition from '@/Components/ManagePosition';
import ManagePartylist from '@/Components/ManagePartylist';

export default function ManageElection({ election, positions = [], partylists = [] }) {
    const [showPartylist, setShowPartylist] = useState(false);

    return (
        <>
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl">
                <ManageElectionHeader election={election} />
                <ManagePosition election={election} positions={positions} />
                <ManagePartylist election={election} partylists={partylists} />
            </div>
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

