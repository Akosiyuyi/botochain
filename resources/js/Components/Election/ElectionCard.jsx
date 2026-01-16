import React from "react";
import { Link } from "@inertiajs/react";
import { Calendar, AlertCircle, Clock, CheckCircle, Zap } from "lucide-react";

export default function ElectionCard({
    imagePath = "https://picsum.photos/seed/picsum/400/200",
    title = "Untitled Election",
    schoolLevels = [],
    date = "No date",
    link = "#",
    mode = "draft"
}) {
    // Define colors per level
    const levelColors = {
        "Grade School": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        "Junior High": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "Senior High": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        "College": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };

    // Status badge configuration
    const statusConfig = {
        draft: {
            label: "Draft",
            icon: Clock,
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            borderColor: "border-yellow-300 dark:border-yellow-700",
        },
        upcoming: {
            label: "Upcoming",
            icon: Clock,
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            borderColor: "border-blue-300 dark:border-blue-700",
        },
        ongoing: {
            label: "Ongoing",
            icon: Zap,
            color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            borderColor: "border-green-300 dark:border-green-700",
        },
        finalized: {
            label: "Finalized",
            icon: CheckCircle,
            color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
            borderColor: "border-teal-300 dark:border-teal-700",
        },
        compromised: {
            label: "Compromised",
            icon: AlertCircle,
            color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            borderColor: "border-red-300 dark:border-red-700",
        },
    };

    const status = statusConfig[mode] || statusConfig.draft;
    const StatusIcon = status.icon;

    const dateLabel = {
        draft: "Created:",
        upcoming: "Starts:",
        ongoing: "Open:",
        finalized: "Ended:",
        compromised: "Ended:",
    }[mode] || "Date:";

    return (
        <Link href={link} className="block group">
            <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 ease-out h-full flex flex-col cursor-pointer">
                {/* Image Container */}
                <div className="relative h-28 md:h-40 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex-shrink-0">
                    <img
                        className="w-full h-full object-cover object-right group-hover:scale-110 transition-transform duration-500"
                        src={imagePath}
                        alt={title}
                        onError={(e) => {
                            e.target.src = "https://picsum.photos/seed/election/400/200";
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

                    {/* Status Badge - Top Right */}
                    <div className={`absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full ${status.color} border ${status.borderColor} font-medium text-xs`}>
                        <StatusIcon className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">{status.label}</span>
                        <span className="sm:hidden">{status.label.substring(0, 1)}</span>
                    </div>

                    {/* School Levels - Bottom Left */}
                    {schoolLevels.length > 0 && (
                        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex flex-wrap gap-1">
                            {schoolLevels.slice(0, 1).map((level, idx) => (
                                <span
                                    key={idx}
                                    className={`text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full backdrop-blur-sm line-clamp-1 ${levelColors[level] || "bg-gray-100/80 text-gray-800"}`}
                                >
                                    {level}
                                </span>
                            ))}
                            {schoolLevels.length > 1 && (
                                <span className="text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full backdrop-blur-sm bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100">
                                    +{schoolLevels.length - 1}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 md:p-4 space-y-2 md:space-y-3 flex flex-col flex-grow">
                    {/* Title */}
                    <div className="flex-grow">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {title}
                        </h3>
                    </div>

                    {/* Date Info */}
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 min-h-5">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">
                            <span className="font-medium hidden md:inline">{dateLabel}</span>
                            <span className="md:hidden">{dateLabel.substring(0, 1)}:</span>
                            <span className="ml-1 truncate">{date}</span>
                        </span>
                    </div>
                </div>

                {/* Hover Border Accent */}
                <div className="absolute inset-0 rounded-lg md:rounded-xl border-2 border-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
            </div>
        </Link>
    );
}
