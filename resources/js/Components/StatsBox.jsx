import { forwardRef } from 'react';

const StatsBox = forwardRef(({ stats = [], showIcons = true }, ref) => {
    const defaultStats = [
        { title: "All Students", value: 0, color: "blue", icon: null },
        { title: "Enrolled Students", value: 0, color: "green", icon: null },
        { title: "Students with no accounts", value: 0, color: "yellow", icon: null },
        { title: "Inactive Students", value: 0, color: "red", icon: null },
    ];

    const displayStats = stats.length > 0 ? stats : defaultStats;

    const colorMap = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    };

    return (
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStats.map((item, idx) => {
                const Icon = item.icon;
                const colorClass = colorMap[item.color] || colorMap.blue;

                return (
                    <div
                        key={idx}
                        className={`${colorClass} p-4 md:p-6 border rounded-lg transition-all hover:shadow-md dark:hover:shadow-lg/20`}
                    >
                        {showIcons && Icon ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-75">{item.title}</p>
                                    <p className="text-2xl md:text-3xl font-bold mt-1">{item.value ?? 0}</p>
                                </div>
                                <Icon className="w-8 h-8 opacity-30" />
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-extrabold">
                                    {item.value ?? 0}
                                </div>
                                <div className="text-sm font-semibold mt-2">
                                    {item.title}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

StatsBox.displayName = 'StatsBox';

export default StatsBox;