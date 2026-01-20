export default function StatsCard({ icon, label, value, color = 'blue', subtext = null }) {
    const colorStyles = {
        blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800',
        green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800',
        purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800',
        indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800',
    };

    const iconColors = {
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        purple: 'text-purple-600 dark:text-purple-400',
        indigo: 'text-indigo-600 dark:text-indigo-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorStyles[color]} border rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 md:p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 ${iconColors[color]}`}>
                    {icon}
                </div>
            </div>
            <p className={`text-xs md:text-sm font-semibold ${iconColors[color]} mb-1`}>
                {label}
            </p>
            <p className={`text-2xl md:text-3xl font-bold ${iconColors[color]}`}>
                {value}
            </p>
            {subtext && (
                <p className={`text-xs mt-2 font-thin ${iconColors[color]}`}>
                    {subtext}
                </p>
            )}
        </div>
    );
}