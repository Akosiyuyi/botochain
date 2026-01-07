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

export default function ResponsiveHorizontalBarChart({ labels, values, eligibleVoters }) {
    const hasData = labels.length > 0 && values.length > 0;

    const data = {
        labels,
        datasets: [
            {
                label: "Votes",
                data: values,
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                maxBarThickness: 30,
            },
        ],
    };

    const options = {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false, // 👈 allows vertical growth
        plugins: {
            legend: {
                display: false, // 👈 disables the legend ("Votes") 
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                max: eligibleVoters, // 👈 your custom last number 
                ticks: { 
                    font: {
                        size: 14,
                    },
                },
            },
        },
    };

    // Dynamic height: 60px per candidate
    const containerHeight = `${labels.length * 60}px`;

    return (
        <div className="w-full md:px-6" style={{ height: hasData ? containerHeight : "auto" }}>
            {hasData ? (
                <Bar data={data} options={options} />
            ) : (
                <div className="flex items-center justify-center h-40">
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                        No candidates have been nominated for this position.
                    </div>
                </div>
            )}
        </div>
    );
}
