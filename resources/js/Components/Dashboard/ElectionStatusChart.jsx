import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FileChartPie } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ElectionStatusChart({ status }) {
    const statusData = [
        { name: 'Draft', value: status.draft, color: '#FCD34D' },
        { name: 'Upcoming', value: status.upcoming, color: '#93C5FD' },
        { name: 'Ongoing', value: status.ongoing, color: '#22C55E' },
        { name: 'Finalized', value: status.finalized, color: '#14B8A6' },
        { name: 'Compromised', value: status.compromised, color: '#F87171' },
    ].filter(item => item.value > 0);

    const total = statusData.reduce((s, i) => s + i.value, 0);

    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    const data = {
        labels: statusData.map(item => item.name),
        datasets: [
            {
                data: statusData.map(item => item.value),
                backgroundColor: statusData.map(item => item.color),
                borderColor: statusData.map(() => 'rgba(255,255,255,0.9)'),
                borderWidth: 2,
                hoverOffset: 12,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // hide legend (we render our own list)
            tooltip: {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                titleColor: isDark ? '#E5E7EB' : '#111827',
                bodyColor: isDark ? '#CBD5E1' : '#1F2937',
                borderColor: isDark ? '#1E293B' : '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = sum ? ((value / sum) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
        cutout: '62%',
        animation: {
            animateRotate: true,
            animateScale: true,
        },
    };

    return (
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/70 shadow-sm">
            {/* Glow accents */}
            <div className="pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full bg-green-200/40 dark:bg-green-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-200/40 dark:bg-blue-500/10 blur-3xl" />

            <div className="relative px-5 md:px-6 py-5 md:py-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-300">
                    <FileChartPie className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Overview</p>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Election Status</h2>
                </div>
            </div>

            <div className="relative p-4 md:p-6">
                {statusData.length > 0 ? (
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="relative flex-1 min-w-[240px] h-56 sm:h-64 md:h-72 lg:h-80">
                            <Doughnut data={data} options={options} />
                            {/* Center metric */}
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{total}</div>
                            </div>
                        </div>

                        <div className="w-full lg:w-64 flex flex-col gap-2">
                            {statusData.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/70 dark:border-gray-700/60"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.name}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-64 md:h-80 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-sm md:text-base">No election data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}