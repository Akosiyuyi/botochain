import { useState } from 'react';
import { Pencil, Trash2, CircleQuestionMark } from 'lucide-react';

export default function PositionList({
    positions,
    isEditing,
    selectedId,
    handleEdit,
    handleDelete,
    noElectionsFlat,
}) {
    const [viewedId, setViewedId] = useState(null);

    const handleView = (id) => {
        setViewedId(viewedId === id ? null : id);
    };

    const renderItem = (pos, index) => {
        const isSelected = isEditing && selectedId === pos.id;
        const isViewed = viewedId === pos.id;

        return (
            <li
                key={pos.id}
                className={`flex flex-col rounded-lg overflow-hidden border
                            ${isSelected
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                        : 'border-green-600'}`}
            >
                <div className="flex items-center justify-between gap-2">
                    {/* LEFT: number + name */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                            className={`shrink-0 px-4 py-2 ${isSelected
                                ? 'bg-yellow-500 text-white dark:text-black'
                                : 'bg-green-600 text-white dark:text-black'
                                }`}
                        >
                            {index + 1}
                        </div>

                        <span
                            title={pos.name}
                            className={`block truncate
        ${isSelected
                                    ? 'font-semibold text-yellow-700 dark:text-yellow-400'
                                    : 'text-black dark:text-white'}
      `}
                        >
                            {pos.name}
                        </span>
                    </div>

                    {/* RIGHT: actions (never move) */}
                    <div className="flex items-center shrink-0">
                        <button
                            type="button"
                            onClick={() => handleView(pos.id)}
                            className="pr-3 text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300
                 transform transition-transform duration-150 hover:scale-110"
                        >
                            <CircleQuestionMark className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleEdit(pos)}
                            className="pr-3 text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400
                 transform transition-transform duration-150 hover:scale-110"
                        >
                            <Pencil className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(pos.id)}
                            className="pr-3 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400
                 transform transition-transform duration-150 hover:scale-110"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>

                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                                ${isViewed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="p-4 bg-gray-100 dark:bg-gray-700">
                        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            Demo Details for {pos.name}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Here you could show more information about this position.
                        </p>
                    </div>
                </div>

            </li>
        );
    };

    return (
        <div className="lg:col-span-2">
            <h1 className="text-gray-900 dark:text-white mb-1 text-sm">
                Positions Created
            </h1>

            {positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                    <img src={noElectionsFlat} alt="No Elections" className="w-80" />
                    <div className="text-gray-500 dark:text-gray-200 text-lg">
                        No positions yet.
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-2">
                    {/* MOBILE / TABLET — single column */}
                    <ul className="flex flex-col gap-2 lg:hidden">
                        {positions.map((pos, index) => renderItem(pos, index))}
                    </ul>

                    {/* DESKTOP — two columns */}
                    <div className="hidden lg:flex gap-2 w-full min-w-0">
                        <ul className="flex flex-col gap-2 flex-1 w-full min-w-0">
                            {positions
                                .map((pos, index) => ({ pos, index }))
                                .filter(({ index }) => index % 2 === 0)
                                .map(({ pos, index }) => renderItem(pos, index))}
                        </ul>

                        <ul className="flex flex-col gap-2 flex-1 w-full min-w-0">
                            {positions
                                .map((pos, index) => ({ pos, index }))
                                .filter(({ index }) => index % 2 !== 0)
                                .map(({ pos, index }) => renderItem(pos, index))}
                        </ul>
                    </div>

                </div>
            )}
        </div>
    );
}
