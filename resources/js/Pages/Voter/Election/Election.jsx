import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ElectionCard from "@/Components/Election/ElectionCard";
import { CalendarDays, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import noElectionsFlat from '@images/NoElectionsFlat.png';
import { Head } from '@inertiajs/react';

function EmptyState({ message = "No elections available" }) {
  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 p-8 sm:p-12 text-center">
      <img
        src={noElectionsFlat}
        alt="No elections"
        className="h-32 sm:h-40 mx-auto mb-4 opacity-80"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>

      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
              ? 'bg-emerald-600 dark:bg-emerald-600 text-white'
              : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
}

function ElectionSection({ title, items, mode, emptyMessage, itemsPerPage = 6 }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!items?.length) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">0 election</span>
        </div>
        <EmptyState message={emptyMessage} />
      </section>
    );
  }

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {items.length} {items.length === 1 ? 'election' : 'elections'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedItems.map((item) => (
          <ElectionCard
            key={item.id}
            imagePath={item.image_path}
            title={item.title}
            schoolLevels={item.school_levels}
            date={item.display_date}
            link={item.link}
            mode={mode}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default function Election() {
  const { elections } = usePage().props;

  return (
    <>
      <Head title="Elections" />

      <div className="space-y-8">
        {/* Hero */}
        <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Elections</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Browse upcoming and ongoing elections. Finalized results are available for review.
              </p>
            </div>
          </div>
        </div>

        {/* Ongoing */}
        <ElectionSection
          title="Ongoing"
          items={elections.ongoing}
          mode="ongoing"
          emptyMessage="No ongoing elections at the moment."
          itemsPerPage={6}
        />

        {/* Upcoming */}
        <ElectionSection
          title="Upcoming"
          items={elections.upcoming}
          mode="upcoming"
          emptyMessage="No upcoming elections scheduled."
          itemsPerPage={6}
        />

        {/* Finalized */}
        <ElectionSection
          title="Finalized"
          items={elections.finalized}
          mode="finalized"
          emptyMessage="No finalized elections yet."
          itemsPerPage={9}
        />

        {/* Notices: Compromised */}
        {elections.compromised?.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notices</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              The following elections were marked as compromised. Voting is disabled.
            </p>

            <ElectionSection
              title=""
              items={elections.compromised}
              mode="compromised"
              emptyMessage=""
              itemsPerPage={6}
            />
          </section>
        )}
      </div>
    </>
  );
}

Election.layout = (page) => {
  const header = (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
        <CalendarDays className="h-6 w-6" />
        Student Elections
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Upcoming, ongoing, and finalized elections
      </p>
    </div>
  );
  return <AuthenticatedLayout header={header}>{page}</AuthenticatedLayout>;
};