export default function StatsBox() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">

                {/* New Students */}
                <div className="p-4 md:p-6 border border-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-blue-800 dark:text-blue-300">120</div>
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-200">All Students</div>
                </div>

                {/* Existing Students */}
                <div className="p-4 md:p-6 border border-green-500 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-green-800 dark:text-green-300">85</div>
                    <div className="text-sm font-semibold text-green-700 dark:text-green-200">Enrolled Students</div>
                </div>

                {/* Incomplete Data */}
                <div className="p-4 md:p-6 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-yellow-800 dark:text-yellow-300">7</div>
                    <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-200">Students with no accounts</div>
                </div>

                {/* Missing Students */}
                <div className="p-4 md:p-6 border border-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-red-800 dark:text-red-300">3</div>
                    <div className="text-sm font-semibold text-red-700 dark:text-red-200">Inactive Students</div>
                </div>
            </div>
    );
};