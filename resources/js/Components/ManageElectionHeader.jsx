import { Ellipsis } from 'lucide-react';
export default function ManageElectionHeader({election}) {
    const levelColors = {
        "Grade School": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        "Junior High": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "Senior High": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        "College": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };
    return (
        <div className="relative h-40 overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            {/* Background image */}
            <img
                className="w-full h-40 object-cover object-right"
                src={election.image_path}
                alt={election.title}
            />

            {/* Overlay with gradient + content */}
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
                <div className="flex justify-between">
                    <div>
                        <h5 className="text-lg font-bold text-white">{election.title}</h5>
                        <h1 className="text-sm text-gray-100">
                            Created <span>{election.created_at}</span>
                        </h1>
                    </div>
                    <Ellipsis className="text-white transition-transform duration-200 hover:scale-125" />
                </div>

                {/* School levels */}
                <div className="flex flex-wrap gap-1 mt-2">
                    {(election.school_levels ?? []).length > 0 ? (
                        election.school_levels.map((level, idx) => (
                            <span
                                key={idx}
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${levelColors[level] || "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {level}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-gray-200">No school levels</span>
                    )}
                </div>
            </div>
        </div>
    );
}