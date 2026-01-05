import { CheckCircle } from "lucide-react";

export default function PartylistCard({ partylist, selected, onSelect }) {
    return (
        <div
            onClick={() => onSelect(partylist.id)}
            className={`cursor-pointer border rounded-lg p-4 transition
                ${selected
                    ? "border-green-500 bg-green-50 dark:bg-green-900/70"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"} 
                hover:shadow-md dark:hover:shadow-lg hover:border-green-400 dark:hover:border-green-500`}
        >
            <div className="flex items-center justify-between h-full">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {partylist.name || "Test"}
                </h3>
                {selected && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
        </div>
    );
}
