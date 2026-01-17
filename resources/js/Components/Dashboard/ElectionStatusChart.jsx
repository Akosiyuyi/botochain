import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ElectionStatusChart({ status }) {
    const statusData = [
        { name: 'Draft', value: status.draft, color: '#FCD34D' },
        { name: 'Upcoming', value: status.upcoming, color: '#93C5FD' },
        { name: 'Ongoing', value: status.ongoing, color: '#86EFAC' },
        { name: 'Finalized', value: status.finalized, color: '#2DD4CF' },
        { name: 'Compromised', value: status.compromised, color: '#FCA5A5' },
    ].filter(item => item.value > 0);

    const data = {
        labels: statusData.map(item => item.name),
        datasets: [
            {
                data: statusData.map(item => item.value),
                backgroundColor: statusData.map(item => item.color),
                borderColor: statusData.map(() => 'rgba(255, 255, 255, 0.8)'),
                borderWidth: 2,
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#374151',
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                titleColor: '#fff',
                bodyColor: '#D1D5DB',
                borderColor: '#374151',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '60%',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Election Status Overview
                </h2>
            </div>
            <div className="p-4 md:p-6">
                {statusData.length > 0 ? (
                    <div className="h-64 md:h-80 flex items-center justify-center">
                        <Doughnut data={data} options={options} />
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