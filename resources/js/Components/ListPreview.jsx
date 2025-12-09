import StatsBox from "./StatsBox";

export default function ListPreview({ school_level, resultStats }) {
    return (
        <div className="mt-6 p-4 overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            {/* Top bar */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-gray-900 dark:text-white font-semibold text-lg">
                    {school_level} List Preview
                </div>
            </div>

            <StatsBox stats={resultStats} />
        </div>
    );
}
