import { ChevronDown, ChevronUp } from 'lucide-react';
export default function LongDropdown({ componentName, showComponent, setShowComponent, className }) {
    return (
        <div
            className={"overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg " + className}
            onClick={() => setShowComponent(!showComponent)}
        >
            <div className="flex items-center justify-between px-6 py-5 cursor-pointer text-black dark:text-white">
                {componentName}
                {showComponent ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
        </div>
    );
}