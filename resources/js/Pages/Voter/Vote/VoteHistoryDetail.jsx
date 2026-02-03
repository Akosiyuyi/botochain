import { ShieldCheck, Check } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IntegrityChecker from '@/Components/Election/VoteIntegrity/IntegrityChecker';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

export default function VoteHistoryDetail({ vote, election }) {
    // Parse positions and choices from vote data
    const positions = vote?.positions ?? [];
    const choices = vote?.choices ?? {};

    const doneCount = Object.keys(choices).length;
    const total = positions.length;
    const progress = total ? Math.round((doneCount / total) * 100) : 0;

    return (
        <div className="pb-6 space-y-4 text-gray-900 dark:text-gray-100">
            <Head title={election?.title ?? 'Election'} />

            {/* Header */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300/80">Voting Record</p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">{election?.title ?? vote?.election_title ?? 'Election'}</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Your vote has been securely recorded.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-4 py-2 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Submitted
                    </div>
                </div>
                {vote?.voted_at && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Voted on: <span className="font-medium">{new Date(vote.voted_at).toLocaleString()}</span>
                    </p>
                )}
            </div>

            <IntegrityChecker
                election={election}
                vote={vote}
                isVoter={true}
            />

            {/* Progress */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 sm:px-5 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                    <span>Completion</span>
                    <span>{doneCount}/{total} positions</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Positions */}
            <div className="space-y-4">
                {positions.map((position) => {
                    const selectedCandidateId = choices[position.id];
                    const selectedCandidate = position.candidates?.find(c => c.id === selectedCandidateId);

                    return (
                        <div
                            key={position.id}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex flex-col items-start">
                                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300/80">Position</p>
                                    <span className="text-lg font-semibold mt-1">{position.name}</span>
                                </div>
                            </div>

                            <div className="px-4 py-4 sm:px-5 sm:py-5">
                                {selectedCandidate ? (
                                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-500 text-white">
                                                {selectedCandidate.name?.slice(0, 2)?.toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedCandidate.name}</p>
                                                {selectedCandidate.partylist?.name && (
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{selectedCandidate.partylist.name}</p>
                                                )}
                                                {selectedCandidate.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                                        {selectedCandidate.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-200 text-xs font-semibold flex-shrink-0">
                                                <Check className="w-5 h-5" />
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center text-gray-600 dark:text-gray-400">
                                        <p className="text-sm">No candidate selected for this position</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Footer */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-4 shadow-sm">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                    This is a complete record of your submitted vote. Your voting choices are private and encrypted.
                </p>
            </div>
        </div>
    );
}

VoteHistoryDetail.layout = (page) => {
    const { election } = page.props;
    const header = (
        <div className="flex items-center gap-4">
            <Link
                href={route("voter.vote-history.index")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6" />
                    Vote Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    View the details of your submitted vote for this election
                </p>
            </div>

        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};
