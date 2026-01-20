import { Shield, Monitor, Smartphone, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function RecentLoginActivity({ recentLogins, className = '' }) {
    return (
        <section className={className}>
            <header className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Recent Login Activity
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Your last 10 login attempts across all devices
                    </p>
                </div>
            </header>

            <div className="space-y-3">
                {recentLogins && recentLogins.length > 0 ? (
                    recentLogins.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            {/* Device Icon */}
                            <div className={`mt-1 h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                log.status
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                                {log.device === 'Mobile' || log.device === 'Tablet' ? (
                                    <Smartphone className={`w-5 h-5 ${
                                        log.status
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`} />
                                ) : (
                                    <Monitor className={`w-5 h-5 ${
                                        log.status
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`} />
                                )}
                            </div>

                            {/* Login Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {log.platform} • {log.browser}
                                    </h3>
                                    {log.status ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Success
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                            <XCircle className="w-3 h-3" />
                                            Failed
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{log.timestamp}</span>
                                    </div>
                                    <div>
                                        <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono">
                                            {log.ip_address}
                                        </code>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-500">
                                        {log.date} at {log.time}
                                    </div>
                                </div>

                                {!log.status && log.reason && (
                                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                        <span className="font-medium">Reason:</span> {log.reason}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No login activity found
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}