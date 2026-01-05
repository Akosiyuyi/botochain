import React from "react";

export default function PartylistDetail({ partylist, positions, candidates }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Partylist Header */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {partylist.name}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {partylist.description || "No description provided."}
        </p>
      </div>

      {/* Candidates grouped by position */}
      {positions.map((pos) => {
        const positionCandidates = candidates.filter(
          (c) => c.position.id === pos.id && c.partylist.id === partylist.id
        );

        return (
          <div key={pos.id} className="mb-8">
            <h2 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
              {pos.name}
            </h2>

            {positionCandidates.length === 0 ? (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                No candidates have been nominated for this position.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {positionCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {c.description || "No description provided"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
