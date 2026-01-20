import { useState } from 'react';
import LongDropdown from '@/Components/LongDropdown';
import PositionResultsChart from './PositionResultsChart';

export default function ElectionResultsView({ results }) {
    const { positions = [], metrics = {} } = results;
    const [expandedPositions, setExpandedPositions] = useState({});

    const togglePosition = (positionId) => {
        setExpandedPositions(prev => ({
            ...prev,
            [positionId]: !prev[positionId]
        }));
    };

    return (
        <div className="space-y-6">
            {/* Overall Metrics Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <MetricCard 
                    label="Eligible Voters" 
                    value={metrics.eligibleVoterCount || 0}
                    icon="👥"
                />
                <MetricCard 
                    label="Votes Cast" 
                    value={metrics.votesCast || 0}
                    icon="🗳️"
                />
                <MetricCard 
                    label="Turnout Rate" 
                    value={`${metrics.progressPercent || 0}%`}
                    highlight={true}
                    icon="📈"
                />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

            {/* Position Results */}
            <div className="space-y-3">
                {positions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No positions available</p>
                    </div>
                ) : (
                    positions.map(position => (
                        <div key={position.id} className="group">
                            <LongDropdown
                                className="mt-0"
                                componentName={position.name}
                                showComponent={expandedPositions[position.id] || false}
                                setShowComponent={(show) => togglePosition(position.id)}
                            />

                            <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 shadow-sm hover:shadow-md rounded-xl transition-all duration-300 ease-out overflow-hidden border border-gray-200 dark:border-gray-700
                                ${expandedPositions[position.id] ? 'p-4 sm:p-6 mt-2 h-auto opacity-100 translate-y-0' :
                                    'p-0 mt-0 h-0 opacity-0 -translate-y-2 pointer-events-none'}`}>
                                
                                {/* Position Stats */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Votes</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">{position.position_total_votes}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Eligible</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">{position.eligible_voter_count}</p>
                                    </div>
                                </div>

                                {/* Chart */}
                                <PositionResultsChart 
                                    position={position}
                                    candidates={position.candidates}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function MetricCard({ label, value, highlight = false, icon = "" }) {
    return (
        <div className={`rounded-xl p-4 sm:p-5 shadow-sm border transition-all duration-200 ${
            highlight 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 hover:shadow-lg' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
                        highlight 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400'
                    }`}>
                        {label}
                    </p>
                    <p className={`text-2xl sm:text-3xl font-bold mt-3 ${
                        highlight 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {value}
                    </p>
                </div>
                {icon && <span className="text-3xl sm:text-4xl opacity-50 ml-3">{icon}</span>}
            </div>
        </div>
    );
}