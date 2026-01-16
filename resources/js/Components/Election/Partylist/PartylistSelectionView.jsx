import { useState } from "react";
import PartylistCard from "@/Components/Election/Partylist/PartylistCard";
import PartylistDetail from "@/Components/Election/Partylist/PartylistDetail";
import { Users, ChevronRight } from "lucide-react";

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
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-4 mt-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-green-600">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Party Lists
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {partylists.length} {partylists.length === 1 ? 'party' : 'parties'} available
                    </p>
                </div>
            </div>

            {/* Cards Container */}
            <div className="relative">
                {/* Scrollable container */}
                <div
                    className="
                        flex gap-3 sm:gap-4 overflow-x-auto
                        sm:grid sm:grid-cols-2 lg:grid-cols-3
                        snap-x snap-mandatory
                        pb-4
                        scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                        scrollbar-track-transparent
                    "
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgb(209 213 219) transparent'
                    }}
                >
                    {partylists.length > 0 ? (
                        partylists.map((p) => (
                            <div 
                                key={p.id} 
                                className="snap-start min-w-[280px] sm:min-w-0 flex-shrink-0"
                            >
                                <PartylistCard
                                    partylist={p}
                                    selected={selectedPartylistId === p.id}
                                    onSelect={setSelectedPartylistId}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Party Lists Yet
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Party lists will appear here once they are added to the election.
                            </p>
                        </div>
                    )}
                </div>

                {/* Fade indicators for mobile scroll */}
                {partylists.length > 0 && (
                    <>
                        {/* Left fade */}
                        <div
                            className={`
                                pointer-events-none absolute top-0 left-0 h-full w-8 sm:hidden
                                bg-gradient-to-r 
                                ${useWhite ? 'from-white dark:from-gray-800' : 'from-gray-100 dark:from-gray-900'}
                                to-transparent
                            `}
                        />
                        {/* Right fade with scroll hint */}
                        <div
                            className={`
                                pointer-events-none absolute top-0 right-0 h-full w-12 sm:hidden
                                bg-gradient-to-l 
                                ${useWhite ? 'from-white dark:from-gray-800' : 'from-gray-100 dark:from-gray-900'}
                                to-transparent
                                flex items-center justify-center
                            `}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-400 animate-pulse" />
                        </div>
                    </>
                )}
            </div>

            {/* Selected Partylist Detail */}
            {selectedPartylist ? (
                <div className="animate-fadeIn">
                    <PartylistDetail
                        partylist={selectedPartylist}
                        positions={positions}
                        candidates={candidates}
                    />
                </div>
            ) : partylists.length > 0 && (
                <div className="text-center py-8 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        👆 Select a party list above to view candidates and details
                    </p>
                </div>
            )}
        </div>
    );
}
