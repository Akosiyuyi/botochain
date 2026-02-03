import { Vote } from 'lucide-react';
import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function VoteHistory({ votes = [] }) {
    return (
        <div className="space-y-8">
            <Head title="Vote History" />

            {/* Vote List */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Votes</h3>
                <div className="space-y-2">
                    {votes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No votes in your history yet</p>
                        </div>
                    ) : (
                        votes.map(vote => (
                            <Link
                                key={vote.id}
                                href={route('voter.vote-history.show', vote.id)}
                                className="block w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <p className="text-gray-900 dark:text-white font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    {vote.election_title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Election
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{vote.created_at}</p>
                            </Link>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

VoteHistory.layout = (page) => {
    const header = (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Vote className="h-6 w-6" />
                Vote History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                View your voting records and participation history
            </p>
        </div>
    );
    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};