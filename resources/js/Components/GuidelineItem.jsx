import React from 'react';
import { Info } from 'lucide-react';

export default function GuidelineItem({ 
    icon: Icon = Info, 
    title, 
    description, 
    number,
    children
}) {
    return (
        <div className="group backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:border-green-500/30 dark:hover:border-green-600/30">
            <div className="flex gap-3 sm:gap-4">
                {/* Icon or Number Badge */}
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                        {number ? (
                            <span className="text-white font-bold text-sm sm:text-base">
                                {number}
                            </span>
                        ) : (
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {description}
                        </p>
                    )}
                    {children && (
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}