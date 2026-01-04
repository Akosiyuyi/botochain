import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";

export default function CandidateList({ candidates = [], actions, state }) {
    // Group candidates by position name
    const grouped = useMemo(() => {
        const map = new Map();
        candidates.forEach((c) => {
            const key = c.position?.name || "Unassigned";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(c);
        });
        return Array.from(map.entries());
    }, [candidates]);

    // Track which positions are open
    const [openPositions, setOpenPositions] = useState({});

    const togglePosition = (positionName) => {
        setOpenPositions((prev) => ({
            ...prev,
            [positionName]: !prev[positionName],
        }));
    };


    return (
        <div className="space-y-4">
            {grouped.map(([positionName, list]) => {
                const isOpen = openPositions[positionName] ?? false; // default closed
                return (
                    <section
                        key={positionName}
                        className="rounded-lg border border-green-600 dark:border-green-700 bg-white dark:bg-gray-900"
                    >
                        {/* Position header */}
                        <button
                            type="button"
                            onClick={() => togglePosition(positionName)}
                            className={`w-full flex justify-between items-center px-4 py-3 
            bg-green-50 dark:bg-green-900/30
            ${isOpen ? "border-b border-green-600 dark:border-green-700" : ""}
            focus:outline-none rounded-t-lg`}

                        >
                            <h2 className="text-lg font-semibold text-green-700 dark:text-green-200">
                                {positionName}
                            </h2>
                            {isOpen ? (
                                <ChevronUp size={18} className="text-green-700 dark:text-green-200" />
                            ) : (
                                <ChevronDown size={18} className="text-green-700 dark:text-green-200" />
                            )}
                        </button>

                        {/* Candidate cards grid with transition */}
                        <div
                            className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-full opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {list.map((c) => {
                                    const isSelected = state?.isEditing && state?.selectedId === c.id;

                                    return (
                                        <div
                                            key={c.id}
                                            className={`rounded-md border p-3 
                                                    ${isSelected ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-600 dark:border-yellow-700" :
                                                    "bg-gray-50 border-gray-200 dark:border-gray-700 dark:bg-gray-800"}`}
                                        >
                                            <div className="text-sm">
                                                <div
                                                    className={`font-medium ${isSelected ? "text-yellow-700 dark:text-yellow-300" : "text-gray-900 dark:text-white"
                                                        }`}
                                                >
                                                    {c.name}
                                                </div>
                                                <div
                                                    className={`mt-1 ${isSelected ? "text-yellow-700 dark:text-yellow-300" : "text-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {c.partylist?.name || "—"}
                                                </div>
                                                <div
                                                    className={`mt-2 text-xs ${isSelected ? "text-yellow-700 dark:text-yellow-300" : "text-gray-500 dark:text-gray-400"
                                                        } max-h-28 overflow-y-auto break-words`}
                                                >
                                                    {c.description || "No description provided."}
                                                </div>
                                            </div>

                                            {/* Candidate action buttons */}
                                            <div className="flex justify-end mt-3 space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => actions?.handleEdit(c)}
                                                    className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 transform transition-transform duration-150 hover:scale-110"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => actions?.handleDelete(c.id)}
                                                    className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transform transition-transform duration-150 hover:scale-110"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
