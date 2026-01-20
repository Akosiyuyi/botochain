import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SearchInput from '@/Components/SearchInput';
import DateRangeFilter from '@/Components/Filters/DateRangeFilter';
import { Head } from '@inertiajs/react';
import ElectionCard from '@/Components/Election/ElectionCard';
import { ModalLink } from '@inertiaui/modal-react';
import noElectionsFlat from '@images/NoElectionsFlat.png';
import { useMemo, useState } from 'react';
import { PlusIcon, Clock, CheckCircle2, AlertTriangle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Election({ elections }) {
    const [activeTab, setActiveTab] = useState('active');
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Tab configuration with color schemes
    const tabs = [
        {
            id: 'active',
            label: 'Active',
            icon: Zap,
            statuses: ['upcoming', 'ongoing'],
            bgColor: 'bg-blue-100 dark:bg-blue-900/40',
            textColor: 'text-blue-600 dark:text-blue-400',
            activeBg: 'bg-blue-50 dark:bg-blue-900/30',
            badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
        },
        {
            id: 'draft',
            label: 'Draft',
            icon: Clock,
            statuses: ['draft'],
            bgColor: 'bg-orange-100 dark:bg-orange-900/40',
            textColor: 'text-orange-600 dark:text-orange-400',
            activeBg: 'bg-orange-50 dark:bg-orange-900/30',
            badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
        },
        {
            id: 'finalized',
            label: 'Completed',
            icon: CheckCircle2,
            statuses: ['finalized'],
            bgColor: 'bg-green-100 dark:bg-green-900/40',
            textColor: 'text-green-600 dark:text-green-400',
            activeBg: 'bg-green-50 dark:bg-green-900/30',
            badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
        },
        {
            id: 'compromised',
            label: 'Compromised',
            icon: AlertTriangle,
            statuses: ['compromised'],
            bgColor: 'bg-red-100 dark:bg-red-900/40',
            textColor: 'text-red-600 dark:text-red-400',
            activeBg: 'bg-red-50 dark:bg-red-900/30',
            badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        },
    ];

    const normalizeDate = (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    };

    const filteredBase = useMemo(() => {
        const from = normalizeDate(dateFrom);
        const to = normalizeDate(dateTo);

        return (Array.isArray(elections) ? elections : []).filter((e) => {
            const title = (e.title || '').toString().toLowerCase();
            const query = search.trim().toLowerCase();
            const matchesSearch = query === '' || title.includes(query);

            const rawDate = e.date || e.start_date || e.display_date || e.updated_at || e.created_at;
            const d = normalizeDate(rawDate);

            const matchesDate =
                (!from || (d && d >= from)) &&
                (!to || (d && d <= to));

            return matchesSearch && matchesDate;
        });
    }, [elections, search, dateFrom, dateTo]);

    const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
    const filteredElections = filteredBase.filter(e => currentTab.statuses.includes(e.status));
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredElections.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedElections = filteredElections.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [activeTab, search, dateFrom, dateTo]);

    const TabIcon = currentTab?.icon;

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Head title="Elections" />
            <div className="mx-auto max-w-7xl space-y-4">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex-1">
                            <SearchInput
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search elections..."
                                className="w-full"
                            />
                        </div>
                        <DateRangeFilter
                            from={dateFrom}
                            to={dateTo}
                            onChangeFrom={setDateFrom}
                            onChangeTo={setDateTo}
                            onClear={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
                        />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const count = filteredBase.filter(e => tab.statuses.includes(e.status)).length;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-3 sm:px-4 py-2.5 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
                                        isActive
                                            ? tab.activeBg
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {/* Icon Badge */}
                                    <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${tab.bgColor} ${tab.textColor}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    {/* Label and Count */}
                                    <div className="flex items-center gap-2">
                                        <span className={`hidden xs:inline ${isActive ? tab.textColor : 'text-gray-600 dark:text-gray-400'}`}>
                                            {tab.label}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                            isActive
                                                ? tab.badge
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {count}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Header Icon Badge */}
                            <div className={`ml-2 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${currentTab.bgColor} ${currentTab.textColor}`}>
                                {TabIcon && <TabIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={`text-lg font-semibold ${currentTab.textColor}`}>
                                    {currentTab?.label} Elections
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filteredElections.length} {filteredElections.length === 1 ? 'election' : 'elections'}
                                    {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Elections Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {paginatedElections.length > 0 ? (
                            paginatedElections.map(election => (
                                <ElectionCard
                                    key={election.id}
                                    imagePath={election.image_path}
                                    title={election.title}
                                    schoolLevels={election.school_levels}
                                    date={election.display_date}
                                    link={election.link}
                                    mode={election.status}
                                />
                            ))
                        ) : (
                            <div className="col-span-1 xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 flex flex-col items-center justify-center text-center py-12 md:py-16">
                                <img
                                    src={noElectionsFlat}
                                    alt="No Elections"
                                    className="w-32 md:w-48 lg:w-64 mb-4"
                                />
                                <h4 className="text-gray-900 dark:text-gray-100 font-semibold text-sm md:text-base mb-1">
                                    No {currentTab?.label.toLowerCase()} elections
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs">
                                    {activeTab === 'active' && 'Elections will appear here once they are created and scheduled'}
                                    {activeTab === 'draft' && 'Start creating a new election to get started'}
                                    {activeTab === 'finalized' && 'Completed elections will appear here'}
                                    {activeTab === 'compromised' && 'Compromised elections will appear here'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(endIndex, filteredElections.length)}</span> of{' '}
                                        <span className="font-medium">{filteredElections.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // Show first, last, current, and adjacent pages
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            currentPage === page
                                                                ? 'z-10 bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600 text-green-600 dark:text-green-400'
                                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Election.layout = (page) => {
    const header = (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlusIcon className="w-6 h-6" />
                Elections
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and monitor all elections
            </p>
        </div>
    );

    const button = (
        <>
            <ModalLink
                href={route("admin.election.create")}
                closeButton={false}
                panelClasses="bg-white dark:bg-gray-800 rounded-lg"
            >
                <PrimaryButton className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                    <PlusIcon className="w-4 h-4" />
                    <span>Create Election</span>
                </PrimaryButton>
            </ModalLink>
        </>
    );

    return <AuthenticatedLayout header={header} button={button}>{page}</AuthenticatedLayout>;
};
