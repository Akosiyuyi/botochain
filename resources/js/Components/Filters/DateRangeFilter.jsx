import React from "react";
import { CalendarRange } from "lucide-react";

export default function DateRangeFilter({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onClear,
  className = "",
  Icon = CalendarRange,
}) {
  const hasValue = Boolean(from || to);

  const baseInput =
    "w-full sm:w-auto rounded-lg border text-gray-600 dark:text-gray-200 " +
    "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 " +
    "px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 " +
    "appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none " +
    "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:hidden";

  const iconClass =
    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 " +
    "group-focus-within:text-green-600 group-focus-within:dark:text-green-400";

  return (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 ${className}`}>
      <div className="relative group">
        <Icon className={iconClass} />
        <input
          type="date"
          value={from}
          onChange={(e) => onChangeFrom?.(e.target.value)}
          className={baseInput}
          aria-label="Date from"
        />
      </div>
      <div className="relative group">
        <Icon className={iconClass} />
        <input
          type="date"
          value={to}
          onChange={(e) => onChangeTo?.(e.target.value)}
          className={baseInput}
          aria-label="Date to"
        />
      </div>
      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
        >
          Clear
        </button>
      )}
    </div>
  );
}