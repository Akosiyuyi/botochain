export default function RecentActivityCard({ activity }) {
    return (
        <div className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start gap-3 md:gap-4">
            <div className="text-xl md:text-2xl flex-shrink-0 mt-0.5">
                {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                </p>
            </div>
        </div>
    );
}