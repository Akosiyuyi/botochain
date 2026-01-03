import { Pencil, Trash2, CircleQuestionMark } from 'lucide-react';

export default function PartylistItem({
    partylist,
    index,
    state,
    actions
}) {
    const isSelected = state.isEditing && state.selectedId === partylist.id;
    const isViewed = state.viewedId === partylist.id;

    return (
        <li
            key={partylist.id}
            className={`flex flex-col rounded-lg overflow-hidden border
                            ${isSelected
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                    : 'border-green-600 bg-gray-50 dark:bg-gray-700'}`}
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
                        title={partylist.name}
                        className={`block truncate
        ${isSelected
                                ? 'font-semibold text-yellow-700 dark:text-yellow-400'
                                : 'text-black dark:text-white'}
      `}
                    >
                        {partylist.name}
                    </span>
                </div>

                {/* RIGHT: actions (never move) */}
                <div className="flex items-center shrink-0">
                    <button
                        type="button"
                        onClick={() => actions.handleView(partylist.id)}
                        className="pr-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                 transform transition-transform duration-150 hover:scale-110"
                    >
                        <CircleQuestionMark className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => actions.handleEdit(partylist)}
                        className="pr-3 text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400
                 transform transition-transform duration-150 hover:scale-110"
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => actions.handleDelete(partylist.id)}
                        className="pr-3 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400
                 transform transition-transform duration-150 hover:scale-110"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            <div
                className={`transition-all duration-300 ease-in-out ${isViewed ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
            >
                <div className="p-4 bg-white dark:bg-gray-800 max-h-52 overflow-y-auto">
                    <p className="text-md font-bold pb-2 text-gray-800 dark:text-gray-200">
                        Description
                    </p>
                    <p className="text-sm font-normal pb-2 ml-4 text-gray-800 dark:text-gray-200 whitespace-pre-line">
                        {partylist.description || "No description provided."}
                    </p>


                </div>
            </div>
        </li >
    );
}