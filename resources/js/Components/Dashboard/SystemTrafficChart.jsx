import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
} from 'chart.js';
import { Monitor, ChevronDown, CircleAlert } from 'lucide-react';
import { useState } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
);

export default function SystemTrafficChart({ traffic }) {
    const [showChart, setShowChart] = useState(false);

    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    const data = {
        labels: traffic.labels,
        datasets: [
            {
                label: 'Votes Cast',
                data: traffic.votesPerHour,
                borderColor: '#22C55E',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#22C55E',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'Active Users',
                data: traffic.activeUsersPerHour,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Remove Chart.js legend
            tooltip: {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                titleColor: isDark ? '#E5E7EB' : '#111827',
                bodyColor: isDark ? '#CBD5E1' : '#1F2937',
                borderColor: isDark ? '#1E293B' : '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
            },
        },
        scales: {
            x: {
                grid: { display: false }, // Remove gridlines
                ticks: {
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    font: { size: 11 },
                },
            },
            y: {
                beginAtZero: true,
                grid: { display: false }, // Remove gridlines
                ticks: {
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    font: { size: 11 },
                    precision: 0,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    const loadConfig = {
        low: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Low' },
        medium: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Medium' },
        high: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'High' },
    };

    const currentLoadConfig = loadConfig[traffic.currentLoad] || loadConfig.low;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header - Always Visible */}
            <button
                onClick={() => setShowChart(!showChart)}
                className="w-full px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">System</p>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            System Activity (24h)
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Load Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${currentLoadConfig.color} ${currentLoadConfig.bg}`}>
                        {currentLoadConfig.label} Load
                    </div>

                    {/* Toggle Icon */}
                    <ChevronDown
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                            showChart ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Collapsible Content */}
            {showChart && (
                <div className="p-4 md:p-6 space-y-4">
                    {/* Custom Legend */}
                    <div className="flex flex-wrap gap-4 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Votes Cast</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</span>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Votes</p>
                            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {traffic.totalVotes24h}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peak Time</p>
                            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {traffic.peakTime || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 col-span-2 md:col-span-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peak Votes</p>
                            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {traffic.peakVotes}
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-64 md:h-80">
                        <Line data={data} options={options} />
                    </div>

                    {/* Load Indicator */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${currentLoadConfig.bg}`}>
                        <CircleAlert className={`w-5 h-5 ${currentLoadConfig.color}`} />
                        <p className={`text-sm font-medium ${currentLoadConfig.color}`}>
                            Current system load is {traffic.currentLoad}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}