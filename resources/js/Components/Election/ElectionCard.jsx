import React from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import { Link } from "@inertiajs/react";

export default function ElectionCard({
    imagePath = "https://picsum.photos/seed/picsum/200/300",
    title = "Untitled Election",
    schoolLevels = [],
    date = "No date",
    link = "#",
    mode = "draft"   // default mode incase null
}) {
    // Define colors per level
    const levelColors = {
        "Grade School": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        "Junior High": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "Senior High": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        "College": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };

    // Decide label + value based on mode 
    const getDateLabel = () => {
        switch (mode) {
            case "draft": return { label: "Created", value: date || "No Date" };
            case "upcoming": return { label: "Starts", value: date || "TBA" };
            case "ongoing": return { label: "Ends", value: date || "TBA" };
            case "ended": return { label: "Ended", value: date || "TBA" };
            default: return { label: "Date", value: date };
        }
    };
    const { label, value } = getDateLabel();

    const getButtonLabel = () => {
        switch (mode) {
            case "draft": return { btn_label: "Manage" };
            case "upcoming": return { btn_label: "View" };
            case "ongoing": return { btn_label: "View" };
            case "ended": return { btn_label: "View" };
            default: return { btn_label: "Manage" };
        }
    }
    const { btn_label } = getButtonLabel();

    return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-gray-700 overflow-hidden group transition hover:shadow-md">
            {/* Image */}
            <img
                className="w-full h-28 object-cover object-right sm:group-hover:brightness-100 group-hover:brightness-75 transition duration-300"
                src={imagePath}
                alt={title}
            />

            {/* Mobile Overlay (text inside image) */}
            <Link href={link}>
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/60 to-transparent p-4 md:hidden">
                    <div>
                        <h5 className="text-lg font-bold text-white truncate w-full">
                            {title}
                        </h5>
                        <h1 className="text-sm text-gray-100">
                            {label} <span>{value}</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                        {schoolLevels.length > 0 ? (
                            schoolLevels.map((level, idx) => (
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
            </Link>

            {/* Desktop Content (text below image) */}
            <div className="hidden md:block p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h5>
                <div className="flex flex-wrap gap-2 mb-3">
                    {schoolLevels.length > 0 ? (
                        schoolLevels.map((level, idx) => (
                            <span
                                key={idx}
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${levelColors[level] || "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {level}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            No school levels
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-sm text-gray-600 dark:text-gray-400">
                        {label} <span>{value}</span>
                    </h1>
                    <Link href={link}>
                        <PrimaryButton className="w-28 flex justify-center">
                            {btn_label}
                            <svg
                                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M1 5h12m0 0L9 1m4 4L9 9"
                                />
                            </svg>
                        </PrimaryButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
