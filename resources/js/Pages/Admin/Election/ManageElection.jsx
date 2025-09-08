import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ManageElectionHeader from '@/Components/ManageElectionHeader';
import ManagePosition from '@/Components/ManagePosition';

export default function ManageElection({ election, positions = [] }) {
    const [showPartylist, setShowPartylist] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <div className="text-xl text-black dark:text-white font-semibold mb-2">
                    <Link href={route('admin.election.index')} className="hover:underline">
                        Election
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="font-medium">{election.title}</span>
                </div>
            }
        >
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <ManageElectionHeader election={election} />
                <ManagePosition election={election} positions={positions} />
                <div
                    className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-4"
                    onClick={() => setShowPartylist(!showPartylist)}
                >
                    <div className="flex items-center justify-between px-6 py-5 cursor-pointer text-gray-900 dark:text-white">
                        Manage Partylists
                        {showPartylist ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

