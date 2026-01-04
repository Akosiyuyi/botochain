import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

export default function LongDropdown({
    componentName,
    showComponent,
    setShowComponent,
    className,
    flag = null, // pass true/false to show status, null to hide
}) {
    return (
        <div
            className={
                "overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg " + className
            }
            onClick={() => setShowComponent(!showComponent)}
        >
            <div className="flex items-center justify-between px-6 py-5 cursor-pointer text-black dark:text-white">
                <span className="flex items-center gap-2">
                    {componentName}
                    {flag !== null && (
                        flag ? (
                            <CheckCircle
                                size={18}
                                className="text-green-600 dark:text-green-400"
                            />
                        ) : (
                            <XCircle
                                size={18}
                                className="text-red-600 dark:text-red-400"
                            />
                        )
                    )}
                </span>
                {showComponent ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
        </div>
    );
}
