import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, BarChart3, ArrowRight, Vote, Lightbulb, TrendingUp } from 'lucide-react';
import StatsCard from '@/Components/Dashboard/StatsCard';

export default function Dashboard({ stats = {}, ongoingElections = [], upcomingElections = [], recentActivity = [] }) {
    const totalStats = (stats.participated || 0) + (stats.upcoming || 0);
    const participationRate = totalStats > 0 ? Math.round((stats.participated / totalStats) * 100) : 0;

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stats Cards - Mobile first, responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatsCard
                        icon={<CheckCircle className="w-6 h-6" />}
                        label="Elections Participated"
                        value={stats.participated ?? 0}
                        color="green"
                        subtext="✓ You've made a difference"
                    />
                    <StatsCard
                        icon={<Clock className="w-6 h-6" />}
                        label="Upcoming Elections"
                        value={stats.upcoming ?? 0}
                        color="blue"
                        subtext="🗳️ Ready for your vote"
                    />
                    <StatsCard
                        icon={<BarChart3 className="w-6 h-6" />}
                        label="Results Available"
                        value={stats.results_available ?? 0}
                        color="purple"
                        subtext="📊 See the outcomes"
                    />
                </div>

                {/* Quick Tips Section */}
                {stats.participated === 0 && stats.upcoming > 0 && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                    Getting Started with Voting
                                </h4>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                                    Your vote matters! Start by exploring the upcoming elections and learn about the candidates. Voting is quick, easy, and completely private.
                                </p>
                                <Link
                                    href={route('voter.election.index')}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                                >
                                    Explore Elections
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Participation Encouragement */}
                {stats.participated > 0 && (
                    <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                    Great Civic Participation! 🎉
                                </h4>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    You've participated in {stats.participated} election{stats.participated !== 1 ? 's' : ''} so far. Keep making informed decisions! 
                                    {stats.upcoming > 0 && ` You have ${stats.upcoming} upcoming election${stats.upcoming !== 1 ? 's' : ''} ready for you.`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ongoing Elections Section - HIGH PRIORITY */}
                {ongoingElections.length > 0 && (
                    <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 sm:p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                                <Vote className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                                    Voting is Open Now!
                                </h3>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                    {ongoingElections.length} election{ongoingElections.length !== 1 ? 's' : ''} you can vote in right now
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {ongoingElections.map((election) => (
                                <Link
                                    key={election.id}
                                    href={route('voter.election.show', election.id)}
                                    className="block p-4 rounded-xl border-2 border-red-200 dark:border-red-700 hover:border-red-400 dark:hover:border-red-500 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors truncate text-base">
                                                {election.title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 animate-pulse">
                                                    ⏰ Vote Now
                                                </span>
                                                {election.has_voted && (
                                                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                                                        ✓ Voted
                                                    </span>
                                                )}
                                                {!election.has_voted && (
                                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                                                        ⚠️ Action Needed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-red-400 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400 flex-shrink-0 transition-colors mt-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Ongoing Elections Message */}
                {ongoingElections.length === 0 && upcomingElections.length === 0 && (
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    No Elections Right Now
                                </h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    There are no ongoing or upcoming elections at the moment. Check back soon for voting opportunities!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upcoming Elections Section */}
                {upcomingElections.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Upcoming Elections
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {upcomingElections.length} election{upcomingElections.length !== 1 ? 's' : ''} available for you
                                </p>
                            </div>
                            <Link
                                href={route('voter.election.index')}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {upcomingElections.map((election) => (
                                <Link
                                    key={election.id}
                                    href={route('voter.election.show', election.id)}
                                    className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {election.title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    election.status === 'Ongoing'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                    {election.status === 'Ongoing' ? '🗳️ Voting Now' : '⏰ Coming Soon'}
                                                </span>
                                                {election.has_voted && (
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                                        ✓ You Voted
                                                    </span>
                                                )}
                                                {!election.has_voted && election.status === 'Ongoing' && (
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                                                        ⚠️ Action Needed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors mt-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Activity Section */}
                {recentActivity.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Vote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Your Voting History
                            </h3>
                            <Link
                                href={route('voter.vote-history.index')}
                                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => (
                                <Link
                                    key={activity.id}
                                    href={route('voter.vote-history.show', activity.id)}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer group"
                                >
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                                        {index < recentActivity.length - 1 && (
                                            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                                        )}
                                    </div>

                                    {/* Activity info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                            {activity.election_title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {activity.voted_at} • {activity.time_ago}
                                        </p>
                                    </div>

                                    {/* Action arrow */}
                                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {upcomingElections.length === 0 && recentActivity.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 sm:p-12 text-center">
                        <Vote className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Elections Yet
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                            There are no elections available right now, but stay tuned! Your school or organization will announce upcoming elections here.
                        </p>
                        <Link
                            href={route('voter.election.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Browse Elections
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = (page) => {
    const user = page.props.auth.user;

    const header = (
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, <span className="text-emerald-600 dark:text-emerald-400">{user.name}</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Your voice matters. Here's your voting overview and upcoming opportunities.
            </p>
        </div>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};


