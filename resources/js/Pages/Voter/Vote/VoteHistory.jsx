import { Vote } from 'lucide-react';
import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function VoteHistory({ votes = [] }) {
    const totalVotes = votes.length;

    return (
        <div className="space-y-8">
            <Head title="Vote History" />

            {/* Vote List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Votes</h3>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <span>Total</span>
                        <span className="text-sm font-bold">{totalVotes}</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {votes.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">No votes in your history yet</p>
                        </div>
                    ) : (
                        votes.map(vote => (
                            <div
                                key={vote.id}
                                className="block w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-5 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md dark:hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-900 dark:text-white font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                            {vote.election_title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Election</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{vote.created_at}</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        <span>Recorded</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Link
                                        href={route('voter.vote-history.show', vote.id)}
                                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 transition-colors"
                                    >
                                        View Vote
                                    </Link>
                                    {vote.election_id && (
                                        <Link
                                            href={route('voter.election.show', vote.election_id)}
                                            className="inline-flex items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-2 transition-colors"
                                        >
                                            View Election
                                        </Link>
                                    )}
                                </div>
                            </div>
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