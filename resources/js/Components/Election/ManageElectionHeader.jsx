import { Ellipsis } from "lucide-react";
import OptionsMenu from "../OptionsMenu";
import { Pencil, Trash2, Undo2, Calendar, Clock } from "lucide-react";
import { useState, useRef } from "react";

export default function ManageElectionHeader({ election, setConfirmingElectionDeletion, className = "", isVoter = false }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const levelColors = {
        "Grade School": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        "Junior High": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "Senior High": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        "College": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };

    const handleDelete = (id) => {
        setConfirmingElectionDeletion(true);
    };


    const getEllipsisOptions = (election) => {
        if (isVoter) {
            return [];
        }
        switch (election.status) {
            case "draft":
                return [
                    {
                        route: route("admin.election.edit", election.id),
                        icon: <Pencil />,
                        name: "Edit Election",
                        color: "gray",
                        isModalLink: true,
                    },
                    {
                        route: route("admin.election.destroy", election.id),
                        icon: <Trash2 />,
                        name: "Delete Election",
                        color: "red",
                        isButton: true,
                        onClick: () => handleDelete(election.id),
                    },
                ];

            case "upcoming":
                return [
                    {
                        route: route("admin.election.restoreToDraft", election.id),
                        icon: <Undo2 />,
                        name: "Restore to Draft",
                        color: "red",
                        isButton: true,
                        onClick: () => handleDelete(election.id),
                    },
                ];

            default:
                return [];
        }
    };
    const ellipsisOptions = getEllipsisOptions(election);


    const getDateLabel = () => {
        switch (election.status) {
            case "draft": return { label: "Created Date:", value: election.display_date || "No Date" };
            case "upcoming": return { label: "Start Date:", value: election.display_date || "TBA" };
            case "ongoing": return { label: "Open Date:", value: election.display_date || "TBA" };
            case "finalized": return { label: "End Date:", value: election.display_date || "TBA" };
            case "compromised": return { label: "End Date:", value: election.display_date || "TBA" };
            default: return { label: "Date:", value: election.display_date };
        }
    };
    const { label, value } = getDateLabel();

    const getTimeLabel = () => {
        switch (election.status) {
            case "upcoming": return { time_label: "Start Time:", time_value: election.display_time || "TBA" };
            case "ongoing": return { time_label: "During:", time_value: election.display_time || "TBA" };
            default: return { time_label: null, time_value: null }
        }
    }
    const { time_label, time_value } = getTimeLabel();

    return (
        <div className={`relative h-40 overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg ${className}`}>
            <img
                className="w-full h-40 object-cover object-right"
                src={election.image_path}
                alt={election.title}
            />

            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
                <div className="flex justify-between relative" ref={menuRef}>
                    <div>
                        <h5 className="text-lg font-bold text-white">{election.title}</h5>

                        {/* Date */}
                        <h1 className="text-sm text-gray-100 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            {label} <span className="text-blue-400 font-medium">{value}</span>
                        </h1>

                        {/* Time */}
                        {time_label && (
                            <h1 className="text-sm text-gray-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-400" />
                                {time_label} <span className="text-green-400 font-medium">{time_value}</span>
                            </h1>
                        )}

                    </div>
                    {ellipsisOptions.length > 0 && (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-start"
                            >
                                <Ellipsis className="text-white transition-transform duration-200 hover:scale-125" />
                            </button>

                            {showMenu && (

                                <OptionsMenu menuId="election-menu" menuRef={menuRef} setShowMenu={setShowMenu} options={ellipsisOptions} />
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                    {(election.school_levels ?? []).length > 0 ? (
                        election.school_levels.map((level, idx) => (
                            <span
                                key={idx}
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${levelColors[level.label] || "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {level.label}
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
