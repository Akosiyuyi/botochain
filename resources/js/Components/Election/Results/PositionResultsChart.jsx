import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PositionResultsChart({ position, candidates }) {
    const hasData = candidates && candidates.length > 0 && candidates.some(c => c.vote_count > 0);

    if (!hasData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="text-4xl mb-3">🗳️</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No votes cast yet</p>
                </div>
            </div>
        );
    }

    // Extract labels and values from candidates
    const labels = candidates.map(c => c.name);
    const values = candidates.map(c => c.vote_count);
    const percentages = candidates.map(c => 
        position.position_total_votes > 0 
            ? ((c.vote_count / position.position_total_votes) * 100).toFixed(1)
            : 0
    );
    
    const maxVotes = Math.max(...values, 1);
    const sortedCandidates = candidates
        .map((c, idx) => ({ ...c, percentage: percentages[idx] }))
        .sort((a, b) => b.vote_count - a.vote_count);

    const colorPalette = [
        "rgba(34, 197, 94, 0.8)",      // green
        "rgba(59, 130, 246, 0.8)",     // blue
        "rgba(168, 85, 247, 0.8)",     // purple
        "rgba(249, 115, 22, 0.8)",     // orange
        "rgba(236, 72, 153, 0.8)",     // pink
        "rgba(14, 165, 233, 0.8)",     // sky
        "rgba(236, 253, 245, 0.8)",    // teal
        "rgba(254, 215, 170, 0.8)",    // amber
    ];

    const data = {
        labels: sortedCandidates.map(c => c.name),
        datasets: [
            {
                label: "Votes",
                data: sortedCandidates.map(c => c.vote_count),
                backgroundColor: sortedCandidates.map((_, i) => colorPalette[i % colorPalette.length]),
                borderColor: sortedCandidates.map((_, i) => colorPalette[i % colorPalette.length].replace('0.8', '1')),
                borderWidth: 0,
                borderRadius: 6,
                maxBarThickness: 40,
            },
        ],
    };

    const options = {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                displayColors: false,
                cornerRadius: 6,
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        return `${context.parsed.x} votes`;
                    },
                    afterLabel: function(context) {
                        const voteCount = context.parsed.x;
                        const percentage = position.position_total_votes > 0
                            ? ((voteCount / position.position_total_votes) * 100).toFixed(1)
                            : 0;
                        return `${percentage}% of total`;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: Math.ceil(maxVotes * 1.1),
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                        weight: '500',
                    },
                    stepSize: 20,
                    precision: 0,
                    callback: function(value) {
                        return Math.floor(value);
                    }
                },
            },
            y: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    padding: 8,
                }
            }
        },
    };

    // Dynamic height based on candidate count
    const containerHeight = Math.max(candidates.length * 50 + 40, 200);

    return (
        <div className="w-full space-y-4">
            {/* Chart Container */}
            <div style={{ height: `${containerHeight}px` }} className="w-full">
                <Bar data={data} options={options} />
            </div>

            {/* Candidate Details - Mobile friendly */}
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">Detailed Results</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {sortedCandidates.map((candidate, idx) => (
                        <div 
                            key={candidate.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div 
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colorPalette[idx % colorPalette.length] }}
                                ></div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {candidate.name}
                                    </p>
                                    {candidate.partylist && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {candidate.partylist}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right ml-2">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {candidate.vote_count}
                                </p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {candidate.percentage}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}