import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BarChart3, Users, Vote, TrendingUp, GraduationCap, AlertCircle, CheckCircle, NotepadText, MapPin, Monitor, ClockFading } from 'lucide-react';
import StatsCard from '@/Components/Dashboard/StatsCard';
import QuickActionCard from '@/Components/Dashboard/QuickActionCard';
import RecentActivityCard from '@/Components/Dashboard/RecentActivityCard';
import ElectionStatusChart from '@/Components/Dashboard/ElectionStatusChart';
import SystemTrafficChart from '@/Components/Dashboard/SystemTrafficChart';

export default function Dashboard({ stats, electionStatusOverview, recentActivity, systemStatus, systemTraffic }) {
    const quickActions = [
        { label: 'View Elections', href: route('admin.election.index'), icon: <BarChart3 />, color: 'blue' },
        { label: 'Manage Students', href: route('admin.students.index'), icon: <GraduationCap />, color: 'green' },
        { label: 'Manage Users', href: route('admin.users.index'), icon: <Users />, color: 'purple' },
        { label: 'View Reports', href: '#', icon: <NotepadText />, color: 'indigo' },
    ];

    // Determine overall system status
    const getOverallStatus = () => {
        const statuses = Object.values(systemStatus).map(item => item.status);

        if (statuses.includes('warning')) return 'warning';
        if (statuses.includes('active')) return 'active';
        if (statuses.every(s => s === 'healthy' || s === 'optimal')) return 'healthy';
        return 'optimal';
    };

    const overallStatus = getOverallStatus();

    const statusConfig = {
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
            iconColor: 'text-yellow-600 dark:text-yellow-300',
        },
        active: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: 'text-blue-600 dark:text-blue-300',
        },
        healthy: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            iconBg: 'bg-green-100 dark:bg-green-900/40',
            iconColor: 'text-green-600 dark:text-green-300',
        },
        optimal: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconColor: 'text-emerald-600 dark:text-emerald-300',
        },
    };

    const currentConfig = statusConfig[overallStatus];

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    <StatsCard
                        icon={<BarChart3 className="w-6 h-6" />}
                        label="Total Elections"
                        value={stats.totalElections}
                        color="blue"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Active Now"
                        value={stats.activeElections}
                        color="green"
                        subtext="Ongoing elections"
                    />
                    <StatsCard
                        icon={<Users className="w-6 h-6" />}
                        label="Total Voters"
                        value={stats.totalVoters}
                        color="purple"
                        subtext="Registered voters"
                    />
                    <StatsCard
                        icon={<Vote className="w-6 h-6" />}
                        label="Votes Cast"
                        value={stats.totalVotes}
                        color="indigo"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Left Column - Charts & Status */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Election Status Overview */}
                        <ElectionStatusChart status={electionStatusOverview} />

                        {/* System Traffic Chart - NEW */}
                        <SystemTrafficChart traffic={systemTraffic} />

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-300">
                                    <ClockFading className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Notifications</p>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                        Recent Activity
                                    </h2>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, idx) => (
                                        <RecentActivityCard key={idx} activity={activity} />
                                    ))
                                ) : (
                                    <div className="px-4 md:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <p className="text-sm md:text-base">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions & Status */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg md:rounded-xl shadow-sm border border-green-200 dark:border-green-800 overflow-hidden">
                            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-green-200 dark:border-green-800 bg-white dark:bg-gray-800/50 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-300">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Routes</p>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                        Quick Actions
                                    </h2>
                                </div>
                            </div>
                            <div className="p-3 md:p-4 flex flex-col gap-2">
                                {quickActions.map((action, idx) => (
                                    <QuickActionCard key={idx} action={action} />
                                ))}
                            </div>
                        </div>

                        {/* System Status - Dynamic Color */}
                        <div className={`bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm border ${currentConfig.border} overflow-hidden`}>
                            <div className={`px-4 md:px-6 py-4 md:py-5 border-b ${currentConfig.border} ${currentConfig.bg} flex items-center gap-3`}>
                                <div className={`h-12 w-12 rounded-xl ${currentConfig.iconBg} flex items-center justify-center ${currentConfig.iconColor}`}>
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">System</p>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        System Status
                                    </h2>
                                </div>
                            </div>
                            <div className="p-4 md:p-6 space-y-4">
                                <StatusItem
                                    label="Data Integrity"
                                    status={systemStatus.dataIntegrity.status}
                                    icon={<CheckCircle className="w-5 h-5" />}
                                    message={systemStatus.dataIntegrity.message}
                                />
                                <StatusItem
                                    label="Active Elections"
                                    status={systemStatus.activeElections.status}
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    message={systemStatus.activeElections.message}
                                />
                                <StatusItem
                                    label="System Performance"
                                    status={systemStatus.systemPerformance.status}
                                    icon={<CheckCircle className="w-5 h-5" />}
                                    message={systemStatus.systemPerformance.details ?? systemStatus.systemPerformance.message}
                                />
                                <StatusItem
                                    label="Alerts"
                                    status={systemStatus.alerts.status}
                                    icon={<AlertCircle className="w-5 h-5" />}
                                    message={systemStatus.alerts.message}
                                />
                            </div>
                        </div>

                        {/* Completion Stats */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg md:rounded-xl shadow-sm border border-green-200 dark:border-emerald-800 p-4 md:p-6">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    {stats.completedElections}
                                </div>
                                <p className="text-sm md:text-base font-semibold text-green-600 dark:text-green-400 mb-4">
                                    {stats.completedElections > 1 ? 'Elections Finalized' : 'Election Finalized'}
                                </p>
                                <div className="w-full bg-gray-300 dark:bg-gray-800 rounded-full h-2">
                                    <div
                                        className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                                        style={{ width: `${stats.totalElections > 0 ? (stats.completedElections / stats.totalElections) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 mt-3">
                                    {stats.totalElections > 0 ? Math.round((stats.completedElections / stats.totalElections) * 100) : 0}% completion rate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatusItem({ label, status, icon, message = null }) {
    const statusStyles = {
        healthy: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
        active: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        optimal: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
        warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    };

    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg ${statusStyles[status]}`}>
            <div className="flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{label}</p>
                {Array.isArray(message) ? (
                    <ul className="text-xs mt-1 opacity-75 space-y-1">
                        {message.map((line, idx) => (
                            <li key={idx}>{line}</li>
                        ))}
                    </ul>
                ) : (
                    message && <p className="text-xs mt-1 opacity-75">{message}</p>
                )}
            </div>
        </div>
    );
}

Dashboard.layout = (page) => {
    const user = page.props.auth.user;

    const header = (
        <h2 className="text-xl md:text-2xl font-semibold leading-tight text-gray-800 dark:text-white">
            Welcome back, <span className="text-green-600 dark:text-green-400">{user.name}</span>
        </h2>
    );

    return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};