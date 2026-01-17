import { Link } from '@inertiajs/react';

export default function QuickActionCard({ action }) {
    const colorStyles = {
        green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
    };

    return (
        <Link href={action.href}>
            <button className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors ${colorStyles[action.color]}`}>
                <span className="text-lg md:text-xl">{action.icon}</span>
                <span className="text-left flex-1">{action.label}</span>
                <span className="text-lg">→</span>
            </button>
        </Link>
    );
}