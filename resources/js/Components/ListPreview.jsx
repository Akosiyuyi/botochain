import StatsBox from "./StatsBox";
import { BarChart3 } from "lucide-react";

export default function ListPreview({ school_level, resultStats }) {
    return (
        <div className="mt-6 space-y-4">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {school_level} Import Summary
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Review upload statistics and results
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Box */}
            <div>
                <StatsBox stats={resultStats} showIcons={true} />
            </div>
        </div>
    );
}
