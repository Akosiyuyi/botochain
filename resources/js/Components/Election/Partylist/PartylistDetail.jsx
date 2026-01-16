import React from "react";
import { Users, MapPin, FileText } from "lucide-react";

export default function PartylistDetail({ partylist, positions, candidates }) {
  const totalCandidates = candidates.filter(c => c.partylist.id === partylist.id).length;

  return (
    <div className="space-y-6">
      {/* Partylist Header Card */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                {partylist.name}
              </h1>
              <p className="text-green-100 text-sm sm:text-base mt-1">
                {totalCandidates} {totalCandidates === 1 ? 'candidate' : 'candidates'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {partylist.description && (
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {partylist.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Candidates by Position */}
      <div className="space-y-4 sm:space-y-6">
        {positions.map((pos) => {
          const positionCandidates = candidates.filter(
            (c) => c.position.id === pos.id && c.partylist.id === partylist.id
          );

          if (positionCandidates.length === 0) {
            return null; // Skip positions with no candidates
          }

          return (
            <div key={pos.id} className="space-y-3">
              {/* Position Header */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-green-400 rounded-full" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {pos.name}
                </h2>
                <span className="ml-auto inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-600 dark:bg-green-700 rounded-full">
                  {positionCandidates.length}
                </span>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {positionCandidates.map((c, idx) => (
                  <div
                    key={c.id}
                    className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Name */}
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors break-words pr-8">
                          {c.name}
                        </h3>
                      </div>

                      {/* Description */}
                      {c.description ? (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                          {c.description}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">
                          No description provided
                        </p>
                      )}

                      {/* Footer Badge */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 rounded-full">
                          {pos.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {candidates.filter(c => c.partylist.id === partylist.id).length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 py-12 text-center">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Candidates Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Candidates for {partylist.name} will appear here once they are added to the election.
            </p>
          </div>
        )}
      </div>

      {/* Statistics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Total Candidates
          </p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            {totalCandidates}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Positions
          </p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {positions.filter(pos => 
              candidates.some(c => c.position.id === pos.id && c.partylist.id === partylist.id)
            ).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-3 sm:p-4 text-center sm:col-span-1 col-span-2">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Party
          </p>
          <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 mt-2 truncate">
            {partylist.name}
          </p>
        </div>
      </div>
    </div>
  );
}
