import { useState } from 'react';
import PositionItem from './PositionItem';

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
                        {positions.map((pos, index) => (
                            <PositionItem key={pos.id} pos={pos} index={index}
                                state={{ isEditing, selectedId, viewedId }}
                                actions={{ handleView, handleEdit, handleDelete }} />
                        ))}
                    </ul>

                    {/* DESKTOP — two columns */}
                    <div className="hidden lg:flex gap-2 w-full min-w-0">
                        <ul className="flex flex-col gap-2 flex-1 w-full min-w-0">
                            {positions
                                .map((pos, index) => ({ pos, index }))
                                .filter(({ index }) => index % 2 === 0)
                                .map(({ pos, index }) => (
                                    <PositionItem key={pos.id} pos={pos} index={index}
                                        state={{ isEditing, selectedId, viewedId }}
                                        actions={{ handleView, handleEdit, handleDelete }} />
                                ))}
                        </ul>

                        <ul className="flex flex-col gap-2 flex-1 w-full min-w-0">
                            {positions
                                .map((pos, index) => ({ pos, index }))
                                .filter(({ index }) => index % 2 !== 0)
                                .map(({ pos, index }) => (
                                    <PositionItem key={pos.id} pos={pos} index={index}
                                        state={{ isEditing, selectedId, viewedId }}
                                        actions={{ handleView, handleEdit, handleDelete }} />
                                ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
