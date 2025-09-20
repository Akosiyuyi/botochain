

export default function StatsBox({stats = []}) {
    const defaultStats = [
        { title: "All Students", value: 0, color: "blue" },
        { title: "Enrolled Students", value: 0, color: "green" },
        { title: "Students with no accounts", value: 0, color: "yellow" },
        { title: "Inactive Students", value: 0, color: "red" },
    ];

    // If stats is empty, fallback to defaults
    const displayStats = stats.length > 0 ? stats : defaultStats;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStats.map((item, idx) => (
                <div
                    key={idx}
                    className={`p-4 md:p-6 border border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-900/30 rounded-lg text-center`}
                >
                    <div className={`text-2xl font-extrabold text-${item.color}-700 dark:text-${item.color}-200`}>
                        {item.value}
                    </div>
                    <div className={`text-sm font-semibold text-${item.color}-700 dark:text-${item.color}-200`}>
                        {item.title}
                    </div>
                </div>
            ))}
        </div>
    );
};