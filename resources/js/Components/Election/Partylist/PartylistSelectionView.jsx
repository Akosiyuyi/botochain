import { useState } from "react";
import PartylistCard from "@/Components/Election/Partylist/PartylistCard";
import PartylistDetail from "@/Components/Election/Partylist/PartylistDetail";

export default function PartylistSelectionView({
    partylists,
    positions,
    candidates,
    useWhite,
}) {
    const [selectedPartylistId, setSelectedPartylistId] = useState(null);

    // Find the selected partylist safely
    const selectedPartylist = partylists.find(p => p.id === selectedPartylistId);

    return (
        <div>
            <h1 className="mt-6 font-bold dark:text-white">Select Partylist</h1>

            <div className="relative max-w-7xl mx-auto p-4">
                {/* Scrollable container */}
                <div
                    className="
            flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6
            snap-x snap-mandatory
          "
                >
                    {partylists.map((p) => (
                        <div key={p.id} className="snap-start min-w-[300px] h-full">
                            <PartylistCard
                                partylist={p}
                                selected={selectedPartylistId === p.id}
                                onSelect={setSelectedPartylistId}
                            />
                        </div>
                    ))}
                </div>

                {/* Right fade indicator */}
                <div
                    className={`pointer-events-none absolute top-0 right-0 h-full w-12 
        bg-gradient-to-l ${useWhite ? 'from-white dark:from-gray-800 ' : 'from-gray-100 dark:from-gray-900 '} 
         to-transparent`}
                />
            </div>

            {/* Render PartylistDetail */}
            {selectedPartylist && (
                <PartylistDetail
                    partylist={selectedPartylist}
                    positions={positions}
                    candidates={candidates}
                />
            )}
        </div>
    );
}
