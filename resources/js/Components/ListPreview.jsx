import { Send, Trash2 } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";

export default function ListPreview() {
    return (
        <div className="mt-6 overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            {/* Top bar */}
            <div className="flex justify-between items-center px-4 py-6">
                <div className="text-gray-900 dark:text-white font-semibold text-lg">
                    List Preview
                </div>
                <div className="space-x-2">
                    <PrimaryButton className="h-8 w-32 flex items-center justify-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>
                            Push <span className="hidden md:inline">List</span>
                        </span>
                    </PrimaryButton>
                    <DangerButton className="h-8 w-36 flex items-center justify-center space-x-2">
                        <Trash2 className="w-4 h-4" />
                        <span className="whitespace-nowrap">
                            Remove <span className="hidden md:inline">List</span>
                        </span>
                    </DangerButton>
                </div>
            </div>

            {/* Stats Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-6">

                {/* New Students */}
                <div className="p-4 border border-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-blue-800 dark:text-blue-300">120</div>
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-200">New Students</div>
                </div>

                {/* Existing Students */}
                <div className="p-4 border border-green-500 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-green-800 dark:text-green-300">85</div>
                    <div className="text-sm font-semibold text-green-700 dark:text-green-200">Existing Students</div>
                </div>

                {/* Incomplete Data */}
                <div className="p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-yellow-800 dark:text-yellow-300">7</div>
                    <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-200">Incomplete Data</div>
                </div>

                {/* Missing Students */}
                <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                    <div className="text-2xl font-extrabold text-red-800 dark:text-red-300">3</div>
                    <div className="text-sm font-semibold text-red-700 dark:text-red-200">Missing Students</div>
                </div>
            </div>
        </div>
    );
}
